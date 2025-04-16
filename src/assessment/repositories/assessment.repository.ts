import { BadRequestException, ConflictException, Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Brackets, DataSource, EntityManager, EntityRepository, Repository } from "typeorm";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { GroupDto } from "../../course/dto/group/group.dto";
import { CourseId } from "../../course/entities/course.entity";
import { GroupId } from "../../course/entities/group.entity";
import { AssignmentRegistrationRepository } from "../../course/repositories/assignment-registration.repository";
import { DbException } from "../../shared/database-exceptions";
import { UserId } from "../../shared/entities/user.entity";
import { AssessmentFilter } from "../dto/assessment-filter.dto";
import { AssessmentCreateDto, AssessmentUpdateDto } from "../dto/assessment.dto";
import { PartialAssessmentDto } from "../dto/partial-assessment.dto";
import { AssessmentUserRelation } from "../entities/assessment-user-relation.entity";
import { Assessment } from "../entities/assessment.entity";
import { PartialAssessment } from "../entities/partial-assessment.entity";

@Injectable()
export class AssessmentRepository extends Repository<Assessment> {
		constructor(private dataSource: DataSource,
			@Inject(AssignmentRegistrationRepository) private readonly assignmentRegistrationRepository: AssignmentRegistrationRepository
		) {
			super(Assessment, dataSource.createEntityManager());
		  }
	async createAssessment(
		assessmentDto: AssessmentCreateDto,
		userIds: string[],
		creatorId: UserId
	): Promise<Assessment> {
		const assessment = this.create(assessmentDto);

		assessment.id = undefined;
		assessment.creatorId = creatorId;

		assessment.partialAssessments =
			assessmentDto.partialAssessments?.map(p => PartialAssessment.create(null, p)) ?? [];

		assessment.assessmentUserRelations = userIds.map(userId => {
			const relation = new AssessmentUserRelation();
			relation.assignmentId = assessmentDto.assignmentId;
			relation.userId = userId;
			return relation;
		});

		try {
			return await this.save(assessment);
		} catch (error) {
			if (error.code === DbException.PG_UNIQUE_VIOLATION) {
				throw new ConflictException("A user has already received an assessment.");
			} else throw error;
		}
	}

	async createAssessments(
		assignmentId: string,
		assessments: AssessmentCreateDto[],
		creatorId: string
	): Promise<void> {
		const entities = await this._createAssessmentEntities(assignmentId, assessments, creatorId);
		const relations = entities.flatMap(a => a.assessmentUserRelations);
		const partialAssessments = entities.flatMap(a => a.partialAssessments);

		try {
			await this.manager.transaction(async trx => {
				await trx.insert(Assessment, entities);
				await trx.insert(AssessmentUserRelation, relations);
				await trx.insert(PartialAssessment, partialAssessments);
			});
		} catch (error) {
			if (error.code === DbException.PG_UNIQUE_VIOLATION) {
				throw new ConflictException("A user has already received an assessment.");
			} else {
				throw error;
			}
		}
	}

	async _createAssessmentEntities(
		assignmentId: string,
		assessments: AssessmentCreateDto[],
		creatorId: string
	): Promise<Assessment[]> {
		const assessmentRelationsRepo = this.manager.getRepository(AssessmentUserRelation);
		const [[registeredGroups]] = await Promise.all([
			this.assignmentRegistrationRepository.getRegisteredGroupsWithMembers(assignmentId),
			assessmentRelationsRepo.find({ where: { assignmentId } })
		]);

		const groupMap = new Map<string, GroupDto>();
		for (const group of registeredGroups) {
			groupMap.set(group.id, group);
		}

		const entities: Assessment[] = assessments.map(a => {
			const assessment = this.create(a);
			assessment.id = randomUUID();
			assessment.assignmentId = assignmentId;
			assessment.creatorId = creatorId;
			assessment.partialAssessments =
				a.partialAssessments?.map(partial =>
					PartialAssessment.create(assessment.id, partial)
				) ?? [];

			if (a.groupId) {
				const group = groupMap.get(a.groupId);

				if (!group) {
					throw new BadRequestException(
						`Group (${a.groupId}) is not registered for this assignment`
					);
				}

				assessment.assessmentUserRelations = group.members.map(m =>
					AssessmentUserRelation.create(assessment.id, assignmentId, m.userId)
				);
			} else if (a.userId) {
				assessment.assessmentUserRelations = [
					AssessmentUserRelation.create(assessment.id, assignmentId, a.userId)
				];
			} else {
				throw new BadRequestException("No groupId or userId defined.");
			}

			return assessment;
		});

		return entities;
	}

	async addOrUpdatePartialAssessment(
		assessmentId: string,
		partialAssessmentDto: PartialAssessmentDto
	): Promise<PartialAssessment> {
		const partialRepo = this.manager.getRepository(PartialAssessment);

		const partialAssessment = partialRepo.create(partialAssessmentDto);
		partialAssessment.assessmentId = assessmentId;

		if (partialAssessmentDto.key) {
			const exists = await partialRepo.findOne({
				where: {
					assessmentId,
					key: partialAssessmentDto.key
				}
			});
			// Set to id of existing to cause an update
			partialAssessment.id = exists?.id;
		} else {
			// Set key to random value if not specified
			partialAssessment.key = Math.floor(Math.random() * 9999999).toString();
		}

		return partialRepo.save(partialAssessment);
	}

	/**
	 * Returns the specified assessment.
	 * Throws `EntityNotFoundError` if it does not exist.
	 * Includes relations:
	 * - Creator
	 * - Partial assessments
	 * - Group (is group assessment)
	 * - User (if user assessment)
	 */
	async getAssessmentById(assessmentId: string): Promise<Assessment> {
		const query = this.createQueryBuilder("assessment")
			.where("assessment.id = :assessmentId", { assessmentId })
			.leftJoinAndSelect("assessment.partialAssessments", "partial")
			.leftJoinAndSelect("assessment.assessmentUserRelations", "userRelation")
			.leftJoinAndSelect("assessment.group", "group")
			.leftJoinAndSelect("userRelation.user", "user")
			.innerJoinAndSelect("assessment.assignment", "assignment")
			.leftJoinAndSelect("assessment.creator", "creator")
			.leftJoinAndSelect("assessment.lastUpdatedBy", "lastUpdatedBy")
			.orderBy("partial.id", "ASC");

		const result = await query.getOne();
		if (!result) throw new EntityNotFoundError(Assessment, null);
		return result;
	}

	/**
	 * Returns all assessments that match the given filter.
	 * Ordered by assignment end date in ascending order.
	 * Includes relations:
	 * - Creator
	 * - Partial assessments
	 * - Group (is group assessment)
	 * - User (if user assessment)
	 */
	async getAssessmentsForAssignment(
		assignmentId: string,
		filter?: AssessmentFilter
	): Promise<[Assessment[], number]> {
		const { name, groupId, userId, creatorId, minScore, skip, take } = filter || {};

		const query = this.createQueryBuilder("assessment")
			.where("assessment.assignmentId = :assignmentId", { assignmentId })
			.leftJoinAndSelect("assessment.creator", "creator")
			.leftJoinAndSelect("assessment.lastUpdatedBy", "lastUpdatedBy")
			.leftJoinAndSelect("assessment.group", "group") // Include group, if it exists
			.leftJoinAndSelect("assessment.assessmentUserRelations", "userRelation")
			.leftJoinAndSelect("userRelation.user", "user")
			.leftJoinAndSelect("assessment.partialAssessments", "partial") // Include partial assessments, if they exist
			.innerJoin("assessment.assignment", "assignment")
			.orderBy("assessment.creationDate", "DESC")
			.addOrderBy("partial.id", "ASC")
			.skip(skip)
			.take(take);

		if (name) {
			query.andWhere(
				new Brackets(qb => {
					qb.where("group.name ILIKE :name", { name: `%${name}%` });
					qb.orWhere("user.displayName ILIKE :name", { name: `%${name}%` });
					qb.orWhere("user.username ILIKE :name", { name: `%${name}%` });
				})
			);
		}

		if (groupId) {
			query.andWhere("assessment.groupId = :groupId", { groupId });
		}

		if (userId) {
			query.andWhere("userRelation.userId = :userId", { userId });
		}

		if (creatorId) {
			query.andWhere("assessment.creatorId = :creatorId", { creatorId });
		}

		if (minScore) {
			query.andWhere("assessment.achievedPoints >= :minScore", { minScore });
		}

		return query.getManyAndCount();
	}

	/**
	 * Returns all assessments of the given user in the specified course.
	 * Includes relations:
	 * - Assignment
	 * - Partial assessments
	 * - Group
	 * - Assessment-User-Relations
	 */
	async getAssessmentsOfUserForCourse(courseId: CourseId, userId: UserId): Promise<Assessment[]> {
		return this.createQueryBuilder("assessment")
			.leftJoinAndSelect("assessment.creator", "creator")
			.leftJoinAndSelect("assessment.lastUpdatedBy", "lastUpdatedBy")
			.leftJoinAndSelect("assessment.partialAssessments", "partials") // Include partial assessments, if they exist
			.leftJoinAndSelect("assessment.group", "group") // Include group, if it exists
			.innerJoin(
				"assessment.assessmentUserRelations",
				"userRelation",
				"userRelation.userId = :userId",
				{ userId }
			) // User condition
			.innerJoinAndSelect(
				"assessment.assignment",
				"assignment",
				"assignment.courseId = :courseId",
				{ courseId }
			) // Course condition
			.orderBy("assessment.creationDate", "DESC")
			.getMany();
	}

	/**
	 * Retrieves all assessments that target the given group.
	 * Ordered by creation date.
	 * Includes relations:
	 * - Creator
	 * - Assignment
	 * - Partial assessments
	 */
	async getAssessmentsOfGroup(groupId: GroupId): Promise<Assessment[]> {
		return this.createQueryBuilder("assessment")
			.where("assessment.groupId = :groupId", { groupId })
			.innerJoinAndSelect("assessment.assignment", "assignment")
			.leftJoinAndSelect("assessment.creator", "creator")
			.leftJoinAndSelect("assessment.lastUpdatedBy", "lastUpdatedBy")
			.leftJoinAndSelect("assessment.partialAssessments", "partials") // Include partial assessments, if they exist
			.orderBy("assessment.creationDate", "DESC")
			.getMany();
	}

	/**
	 * Updates the assessment including its partial assessments.
	 */
	async updateAssessment(
		assessmentId: string,
		updateDto: AssessmentUpdateDto,
		updatedBy: UserId,
		changeCreator: boolean
	): Promise<Assessment> {
		const { achievedPoints, isDraft, comment, partialAssessments } = updateDto;
		const assessment = await this.findOneOrFail({where: {
			assignmentId: assessmentId
		}, 
			relations: ["partialAssessments"]
		});

		if (changeCreator) {
			assessment.creatorId = updatedBy;
			assessment.creationDate = new Date(Date.now());

			assessment.lastUpdatedById = null;
			assessment.updateDate = null;
		} else {
			assessment.lastUpdatedById = updatedBy;
		}

		// Update achievedPoints, if included (check for undefined, because 0 and null is allowed)
		if (achievedPoints !== undefined) {
			assessment.achievedPoints = updateDto.achievedPoints;
		}

		// Update isDraft, if included
		if (isDraft !== undefined && isDraft !== null) {
			assessment.isDraft = updateDto.isDraft;
		}

		// Update comment, if included (allow setting to null)
		if (comment !== undefined) {
			assessment.comment = comment?.length > 0 ? comment : null;
		}

		// Perform insert/update/delete in one transaction
		await this.manager.transaction(async transaction => {
			// Update assessment itself
			await transaction.save(assessment);

			// Update partial assessments, if included
			if (partialAssessments) {
				await this.updatePartialAssessments(transaction, assessmentId, partialAssessments);
			}
		});

		return this.getAssessmentById(assessment.id);
	}

	private async updatePartialAssessments(
		transaction: EntityManager,
		assessmentId: string,
		partialAssessments: PartialAssessmentDto[]
	) {
		// Remove existing partials
		await transaction.delete(PartialAssessment, { assessmentId });

		const partials: PartialAssessment[] = partialAssessments.map(p =>
			PartialAssessment.create(assessmentId, p)
		);

		// Insert the updated partials
		await transaction.insert(PartialAssessment, partials);
	}

	/**
	 * Creates an {@link Assessment} for each user connected to this assessment.
	 * {@link PartialAssessment}s will be copied into each assessment.
	 * Information about creation date, update date and corresponding user not be copied.
	 *
	 * @returns The created {@link Assessment}s.
	 * @throws {@link BadRequestException} when {@link Assessment} had no `assessmentUserRelations`.
	 */
	async convertGroupToIndividualAssessment(
		assessmentId: string,
		creatorId: string
	): Promise<Assessment[]> {
		return this.manager.transaction(async trx => {
			const assessment = await trx.findOne(Assessment, {
				where: {
					id: assessmentId
				},
				relations: ["assessmentUserRelations", "partialAssessments"]
			});

			await trx.remove(assessment);

			if (assessment.assessmentUserRelations.length == 0) {
				throw new BadRequestException("Assessment is not connected to any users.");
			}

			const individualAssessments = this._splitAssessment(assessment, creatorId);

			const createdAssessments = await trx.save(individualAssessments);

			return createdAssessments;
		});
	}

	/**
	 * Creates an {@link Assessment} object for each user that occurs in the `assessment.assessmentUserRelations`.
	 * {@link PartialAssessment}s will be copied into each assessment.
	 * Creation and update dates and corresponding user will be reset to `undefined`.
	 */
	_splitAssessment(assessment: Assessment, creatorId: string): Assessment[] {
		assessment.id = undefined;
		assessment.groupId = undefined;
		assessment.lastUpdatedById = undefined;
		assessment.updateDate = undefined;
		assessment.creatorId = undefined;
		assessment.creationDate = undefined;

		for (const partialAssessment of assessment.partialAssessments) {
			partialAssessment.id = undefined;
			partialAssessment.assessmentId = undefined;
		}

		return assessment.assessmentUserRelations.map(({ userId, assignmentId }) => {
			const individualAssessment = this.create(assessment);
			const relation = new AssessmentUserRelation();
			relation.assignmentId = assignmentId;
			relation.userId = userId;

			individualAssessment.assessmentUserRelations = [relation];
			individualAssessment.creatorId = creatorId;
			return individualAssessment;
		});
	}

	async deleteAssessment(assessmentId: string): Promise<boolean> {
		const deleteResult = await this.delete(assessmentId);
		return deleteResult.affected == 1;
	}
}
