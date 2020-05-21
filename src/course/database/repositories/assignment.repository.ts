import { Repository, EntityRepository } from "typeorm";
import { Assignment } from "../../entities/assignment.entity";
import { AssignmentDto } from "../../dto/assignment/assignment.dto";

@EntityRepository(Assignment)
export class AssignmentRepository extends Repository<Assignment> {

	async createAssignment(assignmentDto: AssignmentDto): Promise<Assignment> {
		const assignment = this.createEntityFromDto(assignmentDto);
		return assignment.save();
	}

	/** Returns all assignments of a course. Sorted by endDate (descending). */
	async getAssignments(courseId: string): Promise<Assignment[]> {
		return this.find({
			where: {
				courseId: courseId
			},
			order: { endDate: "DESC" }
		});
	}

	async getAssignmentById(assignmentId: string): Promise<Assignment> {
		return this.findOneOrFail(assignmentId);
	}

	async getAssignmentById_WithAssessments(assignmentId: string): Promise<Assignment> {
		return this.findOneOrFail(assignmentId, {
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
