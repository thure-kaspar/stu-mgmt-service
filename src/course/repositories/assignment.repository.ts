import { Repository, EntityRepository } from "typeorm";
import { Assignment } from "../../shared/entities/assignment.entity";
import { AssignmentDto } from "../../shared/dto/assignment.dto";

@EntityRepository(Assignment)
export class AssignmentRepository extends Repository<Assignment> {

	async createAssignment(courseId: string, assignmentDto: AssignmentDto): Promise<Assignment> {
		const assignment = this.createEntityFromDto(assignmentDto);
		assignment.courseId = courseId;
		return await assignment.save();
	}

	async getAssignments(courseId: string): Promise<Assignment[]> {
		return await this.find({
			where: {
				courseId: courseId
			}
		});
	}

	async getAssignmentWithAssessments(assignmentId: string): Promise<Assignment> {
		return await this.findOne(assignmentId, {
			relations: ["assessments"]
		});
	}

	private createEntityFromDto(assignmentDto: AssignmentDto): Assignment {
		const assignment = new Assignment();
		assignment.name = assignmentDto.name;
		assignment.comment = assignmentDto.comment;
		assignment.link = assignmentDto.link;
		assignment.type = assignmentDto.type;
		assignment.maxPoints = assignmentDto.maxPoints;
		return assignment;
	}

}