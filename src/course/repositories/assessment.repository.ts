import { Repository, EntityRepository, IsNull } from "typeorm";
import { Assessment } from "../../shared/entities/assessment.entity";
import { AssessmentDto } from "../../shared/dto/assessment.dto";
import { Group } from "../../shared/entities/group.entity";

@EntityRepository(Assessment)
export class AssessmentRepository extends Repository<Assessment> {

	async createAssessment(assessmentDto: AssessmentDto): Promise<Assessment> {
		const assessment = this.createEntityFromDto(assessmentDto);
		return await assessment.save();
	}

	async getAssessmentById(assessmentId: string): Promise<Assessment> {
		return await this.findOne(assessmentId);
	}

	async getAllAssessmentsForAssignment(assignmentId: string): Promise<Assessment[]> {
		return await this.find({
			where: {
				assignmentId: assignmentId
			}
		});
	}

	async getAssessmentsOfUserForCourse(courseId: string, userId: string): Promise<Assessment[]> {
		return await this.find({
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

	async getAssessmentsOfUserForCourse_WithGroups(courseId: string, userId: string): Promise<Assessment[]> {
		const assessments = await this.find({
			where: {
				assignment: {
					courseId: courseId
				},
				assessmentUserRelations: {
					userId: userId
				},
			},
			relations: ["group"]
		});

		return assessments;
	}

	private createEntityFromDto(assessmentDto: AssessmentDto): Assessment {
		const assessment = new Assessment();
		assessment.assignmentId = assessmentDto.assignmentId;
		assessment.groupId = assessmentDto.groupId;
		assessment.achievedPoints = assessmentDto.achievedPoints;
		assessment.comment = assessmentDto.comment;
		return assessment;
	}

}
