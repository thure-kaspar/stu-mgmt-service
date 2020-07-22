import { Controller, Post, Param, Body, Get, Patch, Delete } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AssignmentService } from "../services/assignment.service";
import { AssignmentDto } from "../dto/assignment/assignment.dto";
import { CourseId } from "../entities/course.entity";

@ApiBearerAuth()
@ApiTags("assignments")
@Controller("courses/:courseId/assignments")
export class AssignmentController {
	constructor(private assignmentService: AssignmentService) { }

	@Post()
	@ApiOperation({
		operationId: "createAssignment",
		summary: "Create assignment.",
		description: "Creates a new assignment."
	})
	createAssignment(
		@Param("courseId") courseId: CourseId,
		@Body() assignmentDto: AssignmentDto
	): Promise<AssignmentDto> {

		return this.assignmentService.createAssignment(courseId, assignmentDto);
	}

	@Get()
	@ApiOperation({
		operationId: "getAssignmentsOfCourse",
		summary: "Get assignments of course.",
		description: "Retrieves all assignments of the course."
	})
	getAssignmentsOfCourse(
		@Param("courseId") courseId: CourseId,
	): Promise<AssignmentDto[]> {

		return this.assignmentService.getAssignments(courseId);
	}

	@Get(":assignmentId")
	@ApiOperation({
		operationId: "getAssignmentById",
		summary: "Get assignment.",
		description: "Retrieves the assignment."
	})
	getAssignmentById(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string 
	): Promise<AssignmentDto> {

		return this.assignmentService.getAssignmentById(assignmentId);
	}

	@Patch(":assignmentId")
	@ApiOperation({
		operationId: "updateAssignment",
		summary: "Update assignment.",
		description: "Updates the assignment."
	})
	updateAssignment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Body() assignmentDto: AssignmentDto
	): Promise<AssignmentDto> {

		return this.assignmentService.updateAssignment(assignmentId, assignmentDto);
	}

	@Delete(":assignmentId")
	@ApiOperation({
		operationId: "deleteAssignment",
		summary: "Delete assignment.",
		description: "Deletes the assignment. Returns true, if removal was successful."
	})
	deleteAssignment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string
	): Promise<boolean> {

		return this.assignmentService.deleteAssignment(assignmentId);
	}

}
