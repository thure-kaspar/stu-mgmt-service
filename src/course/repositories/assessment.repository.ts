import { Repository, EntityRepository } from "typeorm";
import { Assessment } from "../entities/assessment.entity";
import { AssessmentDto, AssessmentCreateDto } from "../dto/assessment/assessment.dto";
import { AssessmentUserRelation } from "../entities/assessment-user-relation.entity";
import { PartialAssessmentDto } from "../dto/assessment/partial-assessment.dto";
import { PartialAssessment } from "../entities/partial-assessment.entity";

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
		return assessment.save();
	}

	async addPartialAssessment(partialAssessmentDto: PartialAssessmentDto): Promise<PartialAssessment> {
		const partial = this.manager.getRepository(PartialAssessment).create(partialAssessmentDto);
		return partial.save();
	}

	async getAssessmentById(assessmentId: string): Promise<Assessment> {
		return this.findOneOrFail(assessmentId, {
			relations: ["partialAssessments", "assessmentUserRelations", "assessmentUserRelations.user", "assignment", "creator"]
		});
	}

	async getAllAssessmentsForAssignment(assignmentId: string): Promise<Assessment[]> {
		return this.find({ 
			where: {
				assignmentId: assignmentId
			},
			relations: ["group", "creator", "assessmentUserRelations", "assessmentUserRelations.user"]
		});
	}

	async getAssessmentsOfUserForCourse(courseId: string, userId: string): Promise<Assessment[]> {
		return this.find({
			where: {
				assignment: {
					courseId: courseId
				},
				assessmentUserRelations: {
					userId: userId
				}
			}
		});
	}

	async getAssessmentsOfUserForCourse_WithAssignment_WithGroups(courseId: string, userId: string): Promise<Assessment[]> {
		return this.createQueryBuilder("assessment")
			.innerJoin("assessment.assignment", "assignment", "assignment.courseId = :courseId", { courseId })
			.innerJoin("assessment.assessmentUserRelations", "userRelation", "userRelation.userId = :userId", { userId })
			.leftJoinAndSelect("assessment.partialAssessments", "partial")
			.leftJoinAndSelect("assessment.group", "group")
			.getMany();
	}

	/**
	 * Updates the assessment.
	 */
	async updateAssessment(assessmentId: string, assessmentDto: AssessmentDto): Promise<Assessment> {
		const assessment = await this.findOneOrFail(assessmentId);

		// TODO: Define Patch-Object or create method
		assessment.achievedPoints = assessmentDto.achievedPoints;
		assessment.comment = assessmentDto.comment;

		return assessment.save();
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
