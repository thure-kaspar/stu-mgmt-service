import { Controller, Post, Param, Body, Get, ParseUUIDPipe, Patch, Delete } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AssignmentService } from "../services/assignment.service";
import { AssignmentDto } from "../../shared/dto/assignment.dto";

@ApiTags("assignments")
@Controller("courses/:courseId/assignments")
export class AssignmentController {
	constructor(private assignmentService: AssignmentService) { }

	@Post()
	createAssignment(
		@Param("courseId") courseId: string,
		@Body() assignmentDto: AssignmentDto
	): Promise<AssignmentDto> {

		return this.assignmentService.createAssignment(courseId, assignmentDto);
	}

	@Get()
	getAssignmentsOfCourse(
		@Param("courseId") courseId: string,
	): Promise<AssignmentDto[]> {

		return this.assignmentService.getAssignments(courseId);
	}

	@Get(":assignmentId")
	getAssignmentById(
		@Param("courseId") courseId: string,
		@Param("assignmentId", ParseUUIDPipe) assignmentId: string 
	): Promise<AssignmentDto> {

		return this.assignmentService.getAssignmentById(assignmentId);
	}

	@Patch(":assignmentId")
	updateAssignment(
		@Param("courseId") courseId: string,
		@Param("assignmentId", ParseUUIDPipe) assignmentId: string,
		@Body() assignmentDto: AssignmentDto
	): Promise<AssignmentDto> {

		return this.assignmentService.updateAssignment(assignmentId, assignmentDto);
	}

	@Delete(":assignmentId")
	deleteAssignment(
		@Param("courseId") courseId: string,
		@Param("assignmentId", ParseUUIDPipe) assignmentId: string
	): Promise<boolean> {

		return this.assignmentService.deleteAssignment(assignmentId);
	}

}
