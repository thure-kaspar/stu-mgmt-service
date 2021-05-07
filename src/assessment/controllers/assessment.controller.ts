import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
	Query,
	Req,
	UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { GetUser } from "../../auth/decorators/get-user.decorator";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { GetAssignment, GetParticipant } from "../../course/decorators/decorators";
import { CourseId } from "../../course/entities/course.entity";
import { AssignmentGuard } from "../../course/guards/assignment.guard";
import { CourseMemberGuard } from "../../course/guards/course-member.guard";
import { TeachingStaffGuard } from "../../course/guards/teaching-staff.guard";
import { Assignment } from "../../course/models/assignment.model";
import { Participant } from "../../course/models/participant.model";
import { UserDto } from "../../shared/dto/user.dto";
import { PaginatedResult, throwIfRequestFailed } from "../../utils/http-utils";
import { AssessmentEventDto } from "../dto/assessment-event.dto";
import { AssessmentFilter } from "../dto/assessment-filter.dto";
import { AssessmentCreateDto, AssessmentDto, AssessmentUpdateDto } from "../dto/assessment.dto";
import { PartialAssessmentDto } from "../dto/partial-assessment.dto";
import { AssessmentService } from "../services/assessment.service";

@ApiBearerAuth()
@ApiTags("assessments")
@Controller("courses/:courseId/assignments/:assignmentId/assessments")
@UseGuards(AuthGuard, CourseMemberGuard)
export class AssessmentController {
	constructor(private assessmentService: AssessmentService) {}

	@ApiOperation({
		operationId: "createAssessment",
		summary: "Create assessment.",
		description: "Creates a new assessment."
	})
	@Post()
	@UseGuards(TeachingStaffGuard, AssignmentGuard)
	createAssessment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Body() assessment: AssessmentCreateDto,
		@GetParticipant() participant: Participant,
		@GetAssignment() assignment: Assignment
	): Promise<AssessmentDto> {
		return this.assessmentService.createAssessment(participant, assignment, assessment);
	}

	@ApiOperation({
		operationId: "setPartialAssessment",
		summary: "Set partial assessment.",
		description: "Adds or updates the partial assessment with the specified key."
	})
	@Put(":assessmentId")
	@UseGuards(TeachingStaffGuard)
	setPartialAssessment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Param("assessmentId") assessmentId: string,
		@Body() partial: PartialAssessmentDto
	): Promise<PartialAssessmentDto> {
		return this.assessmentService.setPartialAssessment(assessmentId, partial);
	}

	@ApiOperation({
		operationId: "getAssessmentsForAssignment",
		summary: "Get assessments of assignment.",
		description: "Retrieves assessments that have been created for the assignment."
	})
	@Get()
	@UseGuards(TeachingStaffGuard)
	getAssessmentsForAssignment(
		@Req() request: Request,
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Query() filter?: AssessmentFilter
	): Promise<AssessmentDto[]> {
		return PaginatedResult(
			this.assessmentService.getAssessmentsForAssignment(
				assignmentId,
				new AssessmentFilter(filter)
			),
			request
		);
	}

	@ApiOperation({
		operationId: "getAssessmentById",
		summary: "Get assessment.",
		description: "Retrieves the assessment."
	})
	@Get(":assessmentId")
	getAssessmentById(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Param("assessmentId") assessmentId: string
	): Promise<AssessmentDto> {
		return this.assessmentService.getAssessmentById(assessmentId);
	}

	@ApiOperation({
		operationId: "getEventsOfAssessment",
		summary: "Get assessment events.",
		description: "Retrieves events of the assessment."
	})
	@Get(":assessmentId/events")
	@UseGuards(TeachingStaffGuard)
	getEventsOfAssessment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Param("assessmentId") assessmentId: string
	): Promise<AssessmentEventDto[]> {
		return this.assessmentService.getEventsOfAssessment(assessmentId);
	}

	@Patch(":assessmentId")
	@UseGuards(TeachingStaffGuard)
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
		@GetUser() updatedBy: UserDto
	): Promise<AssessmentDto> {
		return this.assessmentService.updateAssessment(assessmentId, assessmentDto, updatedBy.id);
	}

	@ApiOperation({
		operationId: "deleteAssessment",
		summary: "Delete assessment.",
		description: "Deletes the assessment."
	})
	@Delete(":assessmentId")
	@UseGuards(TeachingStaffGuard)
	deleteAssessment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Param("assessmentId") assessmentId: string
	): Promise<void> {
		return throwIfRequestFailed(
			this.assessmentService.deleteAssessment(assessmentId),
			`Failed to delete assessment (${assessmentId}) of assignment (${assignmentId}).`
		);
	}
}
