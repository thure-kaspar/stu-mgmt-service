import { Repository, EntityRepository } from "typeorm";
import { Assessment } from "../../entities/assessment.entity";
import { AssessmentDto } from "../../dto/assessment/assessment.dto";
import { AssessmentUserRelation } from "../../entities/assessment-user-relation.entity";
import { PartialAssessmentDto } from "../../dto/assessment/partial-assessment.dto";
import { PartialAssessment } from "../../entities/partial-assessment.entity";

@EntityRepository(Assessment)
export class AssessmentRepository extends Repository<Assessment> {

	async createAssessment(assessmentDto: AssessmentDto, userIds: string[]): Promise<Assessment> {
		const assessment = this.createEntityFromDto(assessmentDto);
		assessment.assessmentUserRelations = [];

		// Create AssessmentUserRelations (will be saved due to enabled cascade)
		userIds.forEach(userId => {
			const userRelation = new AssessmentUserRelation();
			userRelation.userId = userId;
			assessment.assessmentUserRelations.push(userRelation);
		});
		
		return assessment.save();
	}

	async addPartialAssessment(partialAssessmentDto: PartialAssessmentDto): Promise<PartialAssessment> {
		const partial = this.manager.getRepository(PartialAssessment).create(partialAssessmentDto);
		return partial.save();
	}

	async getAssessmentById(assessmentId: string): Promise<Assessment> {
		return this.findOneOrFail(assessmentId, {
			relations: ["partialAssessments"]
		});
	}

	async getAllAssessmentsForAssignment(assignmentId: string): Promise<Assessment[]> {
		return this.find({
			where: {
				assignmentId: assignmentId
			}
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
		const assessments = await this.find({
			where: {
				assignment: {
					courseId: courseId
				},
				assessmentUserRelations: {
					userId: userId
				},
			},
			relations: ["assignment, group"]
		});

		return assessments;
	}

	/**
	 * Updates the assessment.
	 *
	 * @param {string} assessmentId
	 * @param {AssessmentDto} assessmentDto
	 * @returns {Promise<Assessment>}
	 * @memberof AssessmentRepository
	 */
	async updateAssessment(assessmentId: string, assessmentDto: AssessmentDto): Promise<Assessment> {
		const assessment = await this.getAssessmentById(assessmentId);

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
