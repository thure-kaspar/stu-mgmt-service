import { Repository, EntityRepository } from "typeorm";
import { Assignment } from "../../../shared/entities/assignment.entity";
import { AssignmentDto } from "../../../shared/dto/assignment.dto";

@EntityRepository(Assignment)
export class AssignmentRepository extends Repository<Assignment> {

	async createAssignment(assignmentDto: AssignmentDto): Promise<Assignment> {
		const assignment = this.createEntityFromDto(assignmentDto);
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
	 * Updates the assignment partially. 
	 */
	async updateAssignment(assignmentId: string, update: Partial<Assignment>): Promise<Assignment> {
		const assignment = await this.getAssignmentById(assignmentId);
		const updated = {...assignment, ...update};
		return this.save(updated);
	}

	async deleteAssignment(assignmentId: string): Promise<boolean> {
		const deleted = await this.remove(this.create({ id: assignmentId }));
		return deleted ? true : false;
	}

	private createEntityFromDto(assignmentDto: AssignmentDto): Assignment {
		const assignment = this.create(assignmentDto);
		return assignment;
	}

}
