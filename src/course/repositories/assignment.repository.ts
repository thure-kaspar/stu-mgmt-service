import { Repository, EntityRepository } from "typeorm";
import { Assignment } from "../entities/assignment.entity";
import { AssignmentDto } from "../dto/assignment/assignment.dto";
import { CourseId } from "../entities/course.entity";
import { AssessmentUpdateDto } from "../../assessment/dto/assessment.dto";

@EntityRepository(Assignment)
export class AssignmentRepository extends Repository<Assignment> {
	async createAssignment(courseId: CourseId, assignmentDto: AssignmentDto): Promise<Assignment> {
		const assignment = this.create(assignmentDto);
		assignment.id = undefined;
		assignment.courseId = courseId;
		assignment.links = assignmentDto.links?.length > 0 ? assignmentDto.links : null;
		assignment.configs = assignmentDto.configs?.length > 0 ? assignmentDto.configs : null;
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
		return this.findOneOrFail({
			where: {
				id: assignmentId
			}
		});
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
		const updated = { ...assignment, ...update, assignmentId };
		return this.save(updated);
	}

	async deleteAssignment(assignmentId: string): Promise<boolean> {
		const deleted = await this.remove(this.create({ id: assignmentId }));
		return deleted ? true : false;
	}
}
