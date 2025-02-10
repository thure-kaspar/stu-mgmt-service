import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { AssignmentState } from "../../shared/enums";
import { throwIfRequestFailed } from "../../utils/http-utils";
import { GetAssignment, GetCourse, GetParticipant } from "../decorators/decorators";
import { AssignmentDto, AssignmentUpdateDto } from "../dto/assignment/assignment.dto";
import { AssignmentId } from "../entities/assignment.entity";
import { CourseId } from "../entities/course.entity";
import { AssignmentGuard } from "../guards/assignment.guard";
import { CourseMemberGuard } from "../guards/course-member/course-member.guard";
import { TeachingStaffGuard } from "../guards/teaching-staff.guard";
import { Assignment } from "../models/assignment.model";
import { Course } from "../models/course.model";
import { Participant } from "../models/participant.model";
import { AssignmentService } from "../services/assignment.service";
import { Public } from "nest-keycloak-connect";
import { environment } from "src/.config/environment";

@ApiBearerAuth()
@ApiTags("assignment")
@UseGuards(AuthGuard, CourseMemberGuard)
@Controller("courses/:courseId/assignments")
@Public(environment.is("development", "demo", "testing"))
export class AssignmentController {
	constructor(private assignmentService: AssignmentService) {}

	@ApiOperation({
		operationId: "createAssignment",
		summary: "Create assignment.",
		description: "Creates a new assignment."
	})
	@Post()
	@UseGuards(TeachingStaffGuard)
	createAssignment(
		@Param("courseId") courseId: CourseId,
		@Body() assignmentDto: AssignmentDto,
		@GetCourse() course: Course
	): Promise<AssignmentDto> {
		return this.assignmentService.createAssignment(course, assignmentDto);
	}

	@Get()
	@ApiOperation({
		operationId: "getAssignmentsOfCourse",
		summary: "Get assignments of course.",
		description: "Retrieves all assignments of the course."
	})
	async getAssignmentsOfCourse(
		@Param("courseId") courseId: CourseId,
		@GetParticipant() participant: Participant
	): Promise<AssignmentDto[]> {
		const isTeachingStuff = participant.isLecturer() || participant.isTutor();
		let assignments = await this.assignmentService.getAssignments(courseId, isTeachingStuff);

		if (participant.isStudent()) {
			assignments = assignments.filter(a => a.state !== AssignmentState.INVISIBLE);
		}

		return assignments;
	}

	@Get(":assignmentId")
	@ApiOperation({
		operationId: "getAssignmentById",
		summary: "Get assignment.",
		description: "Retrieves the assignment."
	})
	@UseGuards(AssignmentGuard)
	getAssignmentById(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@GetParticipant() participant: Participant
	): Promise<AssignmentDto> {
		const isTeachingStuff = participant.isLecturer() || participant.isTutor();
		return this.assignmentService.getAssignmentById(assignmentId, isTeachingStuff);
	}

	@ApiOperation({
		operationId: "updateAssignment",
		summary: "Update assignment.",
		description: "Updates the assignment."
	})
	@Patch(":assignmentId")
	@UseGuards(TeachingStaffGuard, AssignmentGuard)
	updateAssignment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: AssignmentId,
		@GetCourse() course: Course,
		@GetAssignment() assignment: Assignment,
		@Body() update: AssignmentUpdateDto
	): Promise<AssignmentDto> {
		return this.assignmentService.updateAssignment(course, assignment, update);
	}

	@ApiOperation({
		operationId: "deleteAssignment",
		summary: "Delete assignment.",
		description: "Deletes the assignment. Returns true, if removal was successful."
	})
	@Delete(":assignmentId")
	@UseGuards(TeachingStaffGuard, AssignmentGuard)
	async deleteAssignment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string
	): Promise<void> {
		return throwIfRequestFailed(
			this.assignmentService.deleteAssignment(courseId, assignmentId),
			`Failed to delete assignment (${assignmentId}).`
		);
	}
}
