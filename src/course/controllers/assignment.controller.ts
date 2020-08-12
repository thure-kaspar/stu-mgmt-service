import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { throwIfRequestFailed } from "../../utils/http-utils";
import { AssignmentDto, AssignmentUpdateDto } from "../dto/assignment/assignment.dto";
import { CourseId } from "../entities/course.entity";
import { CourseMemberGuard } from "../guards/course-member.guard";
import { AssignmentService } from "../services/assignment.service";
import { GetCourse, GetAssignment } from "../decorators/decorators";
import { Course } from "../models/course.model";
import { Assignment } from "../models/assignment.model";
import { AssignmentGuard } from "../guards/assignment.guard";
import { AssignmentId } from "../entities/assignment.entity";

@ApiBearerAuth()
@ApiTags("assignments")
@UseGuards(AuthGuard(), CourseMemberGuard)
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

	@ApiOperation({
		operationId: "updateAssignment",
		summary: "Update assignment.",
		description: "Updates the assignment."
	})
	@Patch(":assignmentId")
	@UseGuards(AssignmentGuard)
	updateAssignment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: AssignmentId,
		@GetCourse() course: Course,
		@GetAssignment() assignment: Assignment,
		@Body() update: AssignmentUpdateDto
	): Promise<AssignmentDto> {

		return this.assignmentService.updateAssignment(course, assignment, update);
	}

	@Delete(":assignmentId")
	@ApiOperation({
		operationId: "deleteAssignment",
		summary: "Delete assignment.",
		description: "Deletes the assignment. Returns true, if removal was successful."
	})
	async deleteAssignment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string
	): Promise<void> {

		return throwIfRequestFailed(
			this.assignmentService.deleteAssignment(assignmentId),
			`Failed to delete assignment (${assignmentId}).`
		);
	}

}
