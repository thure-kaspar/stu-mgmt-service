import { Controller, Post, Param, Body, Get, Patch, Delete, UseGuards, Query, Req } from "@nestjs/common";
import { AssessmentService } from "../services/assessment.service";
import { AssessmentDto, AssessmentCreateDto, AssessmentUpdateDto } from "../dto/assessment/assessment.dto";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PartialAssessmentDto } from "../dto/assessment/partial-assessment.dto";
import { GetUser } from "../../auth/decorators/get-user.decorator";
import { UserDto } from "../../shared/dto/user.dto";
import { AuthGuard } from "@nestjs/passport";
import { AssessmentEventDto } from "../dto/assessment/assessment-event.dto";
import { CourseId } from "../entities/course.entity";
import { AssessmentFilter } from "../dto/assessment/assessment-filter.dto";
import { PaginatedResult } from "../../utils/http-utils";
import { Request } from "express";

@ApiBearerAuth()
@ApiTags("assessments")
@Controller("courses/:courseId/assignments/:assignmentId/assessments")
//@UseGuards(AuthGuard()) -- temporarily disabled
export class AssessmentController {

	constructor(private assessmentService: AssessmentService) { }

	@Post()
	@ApiOperation({
		operationId: "createAssessment",
		summary: "Create assessment.",
		description: "Creates a new assessment."
	})
	createAssessment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Body() assessment: AssessmentCreateDto
	): Promise<AssessmentDto> {

		return this.assessmentService.createAssessment(assignmentId, assessment);
	}

	@Post(":assessmentId")
	@ApiOperation({
		operationId: "addPartialAssessment",
		summary: "Add partial assessment.",
		description: "Adds a partial assessment for an exisiting assessment. Alternatively, partial assessments can be created together with the assessment."
	})
	addPartialAssessment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Param("assessmentId") assessmentId: string,
		@Body() partial: PartialAssessmentDto
	): Promise<PartialAssessmentDto> {

		return this.assessmentService.addPartialAssessment(assignmentId, assessmentId, partial);
	}

	@Get()
	@ApiOperation({
		operationId: "getAssessmentsForAssignment",
		summary: "Get assessments of assignment.",
		description: "Retrieves assessments that have been created for the assignment."
	})
	getAssessmentsForAssignment(
		@Req() request: Request,
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Query() filter?: AssessmentFilter
	): Promise<AssessmentDto[]> {

		return PaginatedResult(this.assessmentService.getAssessmentsForAssignment(assignmentId, new AssessmentFilter(filter)), request);
	}

	@Get(":assessmentId")
	@ApiOperation({
		operationId: "getAssessmentById",
		summary: "Get assessment.",
		description: "Retrieves the assessment."
	})
	getAssessmentById(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Param("assessmentId") assessmentId: string
	): Promise<AssessmentDto> {

		return this.assessmentService.getAssessmentById(assessmentId);
	}

	@Get(":assessmentId/events")
	@ApiOperation({
		operationId: "getEventsOfAssessment",
		summary: "Get assessment events.",
		description: "Retrieves events of the assessment."
	})
	getEventsOfAssessment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Param("assessmentId") assessmentId: string
	): Promise<AssessmentEventDto[]> {

		return this.assessmentService.getEventsOfAssessment(assessmentId);
	}

	@Patch(":assessmentId")
	@UseGuards(AuthGuard())
	@ApiOperation({
		operationId: "updateAssessment",
		summary: "Update assessment.",
		description: "Updates the assessment."
	})
	updateAssessment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Param("assessmentId") assessmentId: string,
		@Body() assessmentDto: AssessmentUpdateDto,
		@GetUser() updatedBy: UserDto,
	): Promise<AssessmentDto> {

		return this.assessmentService.updateAssessment(assessmentId, assessmentDto, updatedBy.id);
	}

	@Delete(":assessmentId")
	@ApiOperation({
		operationId: "deleteAssessment",
		summary: "Delete assessment.",
		description: "Deletes the assessment. Returns true, if removal was successful."
	})
	deleteAssessment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Param("assessmentId") assessmentId: string
	): Promise<boolean> {

		return this.assessmentService.deleteAssessment(assessmentId);
	}

}
