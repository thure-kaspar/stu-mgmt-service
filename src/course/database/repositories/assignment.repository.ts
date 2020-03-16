import { Repository, EntityRepository } from "typeorm";
import { Assignment } from "../../../shared/entities/assignment.entity";
import { AssignmentDto } from "../../../shared/dto/assignment.dto";

@EntityRepository(Assignment)
export class AssignmentRepository extends Repository<Assignment> {

	async createAssignment(courseId: string, assignmentDto: AssignmentDto): Promise<Assignment> {
		const assignment = this.createEntityFromDto(assignmentDto);
		assignment.courseId = courseId;
		return assignment.save();
	}

	async getAssignments(courseId: string): Promise<Assignment[]> {
		return this.find({
			where: {
				courseId: courseId
			}
		});
	}

	async getAssignmentById(assignmentId: string): Promise<Assignment> {
		return this.findOne(assignmentId);
	}

	async getAssignmentById_WithAssessments(assignmentId: string): Promise<Assignment> {
		return this.findOne(assignmentId, {
			relations: ["assessments"]
		});
	}

	/**
	 * Updates the assignment. 
	 */
	async updateAssignment(assignmentId: string, assignmentDto: AssignmentDto): Promise<Assignment> {
		const assignment = await this.getAssignmentById(assignmentId);
		// TODO: Define Patch-Object or create method
		assignment.name = assignmentDto.name;
		assignment.type = assignmentDto.type;
		assignment.state = assignmentDto.state;
		assignment.startDate = assignmentDto.startDate;
		assignment.endDate = assignmentDto.endDate;
		assignment.maxPoints = assignmentDto.maxPoints;
		assignment.comment = assignmentDto.comment;
		assignment.link = assignmentDto.link;
		assignment.collaborationType = assignmentDto.collaborationType;

		return assignment.save();
	}

	async deleteAssignment(assignmentId: string): Promise<boolean> {
		const deleted = await this.remove(this.create({ id: assignmentId }));
		return deleted ? true : false;
	}

	private createEntityFromDto(assignmentDto: AssignmentDto): Assignment {
		const assignment = new Assignment();
		assignment.name = assignmentDto.name;
		assignment.state = assignmentDto.state;
		assignment.startDate = assignmentDto.startDate;
		assignment.endDate = assignmentDto.endDate;
		assignment.comment = assignmentDto.comment;
		assignment.link = assignmentDto.link;
		assignment.type = assignmentDto.type;
		assignment.maxPoints = assignmentDto.maxPoints;
		assignment.collaborationType = assignment.collaborationType;
		return assignment;
	}

}
