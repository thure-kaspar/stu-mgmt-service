import { Repository, EntityRepository } from "typeorm";
import { Assignment } from "../entities/assignment.entity";
import { AssignmentDto } from "../dto/assignment/assignment.dto";
import { CourseId } from "../entities/course.entity";
import { AssessmentUpdateDto } from "../dto/assessment/assessment.dto";

@EntityRepository(Assignment)
export class AssignmentRepository extends Repository<Assignment> {

	async createAssignment(courseId: CourseId, assignmentDto: AssignmentDto): Promise<Assignment> {
		const assignment = this.createEntityFromDto(courseId, assignmentDto);
		return this.save(assignment);
	}

	/** Returns all assignments of a course. Sorted by endDate (descending). */
	async getAssignments(courseId: CourseId): Promise<Assignment[]> {
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
	async updateAssignment(assignmentId: string, update: AssessmentUpdateDto): Promise<Assignment> {
		const assignment = await this.getAssignmentById(assignmentId);
		const updated = {...assignment, ...update};
		return this.save(updated);
	}

	async deleteAssignment(assignmentId: string): Promise<boolean> {
		const deleted = await this.remove(this.create({ id: assignmentId }));
		return deleted ? true : false;
	}

	private createEntityFromDto(courseId: CourseId, assignmentDto: AssignmentDto): Assignment {
		const assignment = this.create(assignmentDto);
		assignment.courseId = courseId;
		assignment.links = assignmentDto.links?.length > 0 ? assignmentDto.links : null;
		return assignment;
	}

}
