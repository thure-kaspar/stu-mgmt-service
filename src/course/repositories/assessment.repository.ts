import { Repository, EntityRepository } from "typeorm";
import { Assessment } from "../../shared/entities/assessment.entity";
import { AssessmentDto } from "../../shared/dto/assessment.dto";

@EntityRepository(Assessment)
export class AssessmentRepository extends Repository<Assessment> {

	async createAssessment(assessmentDto: AssessmentDto): Promise<Assessment> {
		const assessment = this.createEntityFromDto(assessmentDto);
		return await assessment.save();
	}

	async getAssessmentsForAssignment(assignmentId: string): Promise<Assessment[]> {
		return await this.find({
			where: {
				assignmentId: assignmentId
			}
		});
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