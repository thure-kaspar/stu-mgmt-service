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

	async getAssignmentById(assignmentId: string): Promise<Assignment> {
		return await this.findOne(assignmentId);
	}

	async getAssignmentById_WithAssessments(assignmentId: string): Promise<Assignment> {
		return await this.findOne(assignmentId, {
			relations: ["assessments"]
		});
	}

	/**
	 * Updates the assignment. 
	 *
	 * @param {string} assignmentId
	 * @param {AssignmentDto} assignmentDto
	 * @returns {Promise<Assignment>}
	 * @memberof AssignmentRepository
	 */
	async updateAssignment(assignmentId: string, assignmentDto: AssignmentDto): Promise<Assignment> {
		const assignment = this.createEntityFromDto(assignmentDto);
		return await assignment.save();
	}

	async deleteAssignment(assignmentId: string): Promise<boolean> {
		const deleteResult = await this.delete(assignmentId);
		return deleteResult.affected == 1;
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
