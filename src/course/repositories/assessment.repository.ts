import { Repository, EntityRepository } from "typeorm";
import { Assessment } from "../entities/assessment.entity";
import { AssessmentDto, AssessmentCreateDto, AssessmentUpdateDto } from "../dto/assessment/assessment.dto";
import { AssessmentUserRelation } from "../entities/assessment-user-relation.entity";
import { PartialAssessmentDto } from "../dto/assessment/partial-assessment.dto";
import { PartialAssessment } from "../entities/partial-assessment.entity";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { CourseId } from "../entities/course.entity";
import { AssessmentFilter } from "../dto/assessment/assessment-filter.dto";

@EntityRepository(Assessment)
export class AssessmentRepository extends Repository<Assessment> {

	async createAssessment(assessmentDto: AssessmentCreateDto, userIds: string[]): Promise<Assessment> {
		const assessment = this.createEntityFromDto(assessmentDto);
		assessment.assessmentUserRelations = userIds.map(userId => {
			const relation = new AssessmentUserRelation();
			relation.assignmentId = assessmentDto.assignmentId;
			relation.userId = userId;
			return relation;
		});
		return this.save(assessment);
	}

	async addPartialAssessment(partialAssessmentDto: PartialAssessmentDto): Promise<PartialAssessment> {
		const partialRepo = this.manager.getRepository(PartialAssessment);
		const partial = partialRepo.create(partialAssessmentDto);
		return partialRepo.save(partial);
	}

	async getAssessmentById(assessmentId: string): Promise<Assessment> {
		const query = this.createQueryBuilder("assessment")
			.where("assessment.id = :assessmentId", { assessmentId })
			.leftJoinAndSelect("assessment.partialAssessments", "partial")
			.leftJoinAndSelect("assessment.assessmentUserRelations", "userRelation")
			.leftJoinAndSelect("userRelation.user", "user")
			.innerJoinAndSelect("assessment.assignment", "assignment")
			.innerJoinAndSelect("assessment.creator", "creator")
			.orderBy("partial.id", "ASC");

		const result = await query.getOne();
		if (!result) throw new EntityNotFoundError(Assessment, null);
		return result;
	}

	async getAssessmentsForAssignment(assignmentId: string, filter?: AssessmentFilter): Promise<[Assessment[], number]> {
		const { groupId, userId, creatorId, minScore, skip, take } = filter || { };

		const query = this.createQueryBuilder("assessment")
			.where("assessment.assignmentId = :assignmentId", { assignmentId })
			.innerJoinAndSelect("assessment.creator", "creator")
			.leftJoinAndSelect("assessment.group", "group") // Include group, if it exists
			.leftJoinAndSelect("assessment.partialAssessments", "partials") // Include partial assessments, if they exist
			.innerJoin("assessment.assignment", "assignment")
			.orderBy("assignment.endDate", "ASC")
			.skip(skip)
			.take(take);

		if (groupId) {
			query.andWhere("assessment.groupId = :groupId", { groupId });
		}

		if (userId) {
			query.leftJoin("assessment.assessmentUserRelations", "userRelation", "userRelation.userId = :userId", { userId });
		}

		if (creatorId) {
			query.andWhere("assessment.creatorId = :creatorId", { creatorId });
		}

		if (minScore) {
			query.andWhere("assessment.achievedPoints >= :minScore", { minScore });
		}

		return query.getManyAndCount();
	}

	async getAssessmentsOfUserForCourse(courseId: CourseId, userId: string): Promise<Assessment[]> {
		return this.createQueryBuilder("assessment")
			.innerJoinAndSelect("assessment.creator", "creator")
			.leftJoinAndSelect("assessment.partialAssessments", "partials") // Include partial assessments, if they exist
			.leftJoinAndSelect("assessment.group", "group") // Include group, if it exists
			.innerJoin("assessment.assessmentUserRelations", "userRelation", "userRelation.userId = :userId", { userId }) // User condition
			.innerJoin("assessment.assignment", "assignment", "assignment.courseId = :courseId", { courseId }) // Course condition
			.getMany();
	}

	/**
	 * Updates the assessment including its partial assessments.
	 */
	async updateAssessment(assessmentId: string, assessmentDto: AssessmentUpdateDto): Promise<Assessment> {
		const partialRepo = this.manager.getRepository(PartialAssessment);
		const assessment = await this.findOneOrFail(assessmentId, { 
			relations: ["partialAssessments"]
		});

		// Update native properties
		assessment.achievedPoints = assessmentDto.achievedPoints;
		assessment.comment = assessmentDto.comment;

		// Find removed partial assessments
		const deletedPartials = [];
		assessment.partialAssessments.forEach(p => {
			if (!assessmentDto.partialAssessments?.find(pDto => pDto.id === p.id)) {
				deletedPartials.push(p.id);
			}
		});

		// Find updated partial assessments
		const updatedPartials = [];
		assessment.partialAssessments.forEach(existing => {
			// If user didn't remove it, we should find the partial assessment in the dto
			const updated = assessmentDto.partialAssessments?.find(partial => existing.id === partial.id);
			// Update properties of edited partial assessment
			Object.assign(existing, updated);
			updatedPartials.push(existing);
		});

		// Find added partial assessments
		const addedPartials = assessmentDto.partialAssessments?.filter(p => !p.id) ?? [];
		
		// Perform inserts, updated and deletes in transaction
		await this.manager.transaction(async transaction => {
			await transaction.save(assessment);
			
			if (deletedPartials.length > 0) {
				await transaction.delete(PartialAssessment, deletedPartials);
			}

			if (addedPartials.length > 0) {
				await transaction.insert(PartialAssessment, addedPartials);
			}

			if (updatedPartials.length > 0) {
				updatedPartials.forEach(async update => {
					await transaction.update(PartialAssessment, { id: update.id }, update);
				});
			}

		});

		return this.getAssessmentById(assessment.id);
	}

	async deleteAssessment(assessmentId: string): Promise<boolean> {
		const deleteResult = await this.delete(assessmentId);
		return deleteResult.affected == 1;
	}

	private createEntityFromDto(assessmentDto: AssessmentDto): Assessment {
		const assessment = this.create(assessmentDto);
		assessment.partialAssessments?.forEach(p => p.assessmentId = null); // Id can't be known prior to insert -> prevent insert with wrong id
		return assessment;
	}

}
