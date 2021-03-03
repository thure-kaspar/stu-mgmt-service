import { Repository, EntityRepository, EntityManager, Brackets } from "typeorm";
import { Assessment } from "../entities/assessment.entity";
import {
	AssessmentDto,
	AssessmentCreateDto,
	AssessmentUpdateDto
} from "../dto/assessment/assessment.dto";
import { AssessmentUserRelation } from "../entities/assessment-user-relation.entity";
import { PartialAssessmentDto } from "../dto/assessment/partial-assessment.dto";
import { PartialAssessment } from "../entities/partial-assessment.entity";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { CourseId } from "../entities/course.entity";
import { AssessmentFilter } from "../dto/assessment/assessment-filter.dto";
import { UserId } from "../../shared/entities/user.entity";
import { GroupId } from "../entities/group.entity";

@EntityRepository(Assessment)
export class AssessmentRepository extends Repository<Assessment> {
	async createAssessment(
		assessmentDto: AssessmentCreateDto,
		userIds: string[],
		creatorId: UserId
	): Promise<Assessment> {
		const assessment = this.createEntityFromDto({ ...assessmentDto, creatorId });
		assessment.assessmentUserRelations = userIds.map(userId => {
			const relation = new AssessmentUserRelation();
			relation.assignmentId = assessmentDto.assignmentId;
			relation.userId = userId;
			return relation;
		});
		return this.save(assessment);
	}

	async addPartialAssessment(
		partialAssessmentDto: PartialAssessmentDto
	): Promise<PartialAssessment> {
		const partialRepo = this.manager.getRepository(PartialAssessment);
		const partial = partialRepo.create(partialAssessmentDto);
		return partialRepo.save(partial);
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
		updatedBy: UserId
	): Promise<Assessment> {
		const { achievedPoints, comment } = updateDto;
		const assessment = await this.findOneOrFail(assessmentId, {
			relations: ["partialAssessments"]
		});

		assessment.lastUpdatedById = updatedBy;

		// Update achievedPoints, if included (check for undefined or null, because 0 is allowed)
		if (achievedPoints !== undefined && achievedPoints !== null) {
			assessment.achievedPoints = updateDto.achievedPoints;
		}

		// Update comment, if included (allow setting to null)
		if (comment !== undefined) {
			assessment.comment = comment?.length > 0 ? comment : null;
		}

		// Perform insert/update/delete in one transaction
		await this.manager.transaction(async transaction => {
			// Update assessment itself
			await transaction.save(assessment);

			// Insert/Update/Remove partials
			await this.updatePartials(transaction, updateDto, assessment.partialAssessments);
		});

		return this.getAssessmentById(assessment.id);
	}

	private async updatePartials(
		transaction: EntityManager,
		updateDto: AssessmentUpdateDto,
		originalPartials: PartialAssessment[]
	): Promise<void> {
		const {
			addPartialAssessments,
			updatePartialAssignments,
			removePartialAssignments
		} = updateDto;

		if (removePartialAssignments?.length > 0) {
			const ids = removePartialAssignments.map(p => p.id);
			await transaction.delete(PartialAssessment, ids);
		}

		// Insert new partials
		if (addPartialAssessments?.length > 0) {
			await transaction.insert(PartialAssessment, addPartialAssessments);
		}

		// Update partials
		if (updatePartialAssignments?.length > 0) {
			updatePartialAssignments.forEach(async update => {
				// Ensure that partial actually existed in assessment
				if (originalPartials.find(p => p.id == update.id)) {
					await transaction.update(PartialAssessment, { id: update.id }, update);
				}
			});
		}
	}

	async deleteAssessment(assessmentId: string): Promise<boolean> {
		const deleteResult = await this.delete(assessmentId);
		return deleteResult.affected == 1;
	}

	private createEntityFromDto(assessmentDto: AssessmentDto): Assessment {
		const assessment = this.create(assessmentDto);
		assessment.partialAssessments?.forEach(p => (p.assessmentId = null)); // Id can't be known prior to insert -> prevent insert with wrong id
		return assessment;
	}
}
