import { Repository, EntityRepository, EntityManager } from "typeorm";
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
	async updateAssessment(assessmentId: string, updateDto: AssessmentUpdateDto): Promise<Assessment> {
		const { achievedPoints, comment } = updateDto;
		const assessment = await this.findOneOrFail(assessmentId, { 
			relations: ["partialAssessments"]
		});

		// Update achievedPoints, if included
		if (achievedPoints) {
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

	private async updatePartials(transaction: EntityManager, updateDto: AssessmentUpdateDto, originalPartials: PartialAssessment[]): Promise<void> {
		const { addPartialAssessments, updatePartialAssignments, removePartialAssignments } = updateDto;
		
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
			updatePartialAssignments.forEach(async (update) => {
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
		assessment.partialAssessments?.forEach(p => p.assessmentId = null); // Id can't be known prior to insert -> prevent insert with wrong id
		return assessment;
	}

}
