import { Controller, Post, Param, Body, ParseUUIDPipe, Get, Patch, Delete } from "@nestjs/common";
import { AssessmentService } from "../services/assessment.service";
import { AssessmentDto } from "../dto/assessment/assessment.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PartialAssessmentDto } from "../dto/assessment/partial-assessment.dto";

@ApiTags("assessments")
@Controller("courses/:courseId/assignments/:assignmentId/assessments")
export class AssessmentController {

	constructor(private assessmentService: AssessmentService) { }

	@Post()
	@ApiOperation({
		operationId: "createAssessment",
		summary: "Create assessment",
		description: "Creates a new assessment."
	})
	createAssessment(
		@Param("courseId") courseId: string,
		@Param("assignmentId", ParseUUIDPipe) assignmentId: string,
		@Body() assessmentDto: AssessmentDto
	): Promise<AssessmentDto> {

		return this.assessmentService.createAssessment(assignmentId, assessmentDto);
	}

	@Post(":assessmentId")
	@ApiOperation({
		operationId: "addPartialAssessment",
		summary: "Add partial assessment",
		description: "Adds a partial assessment for an exisiting assessment. Alternatively, partial assessments can be created together with the assessment."
	})
	addPartialAssessment(
		@Param("courseId") courseId: string,
		@Param("assessmentId") assessmentId: string,
		@Body() partial: PartialAssessmentDto
	): Promise<PartialAssessmentDto> {

		return this.assessmentService.addPartialAssessment(assessmentId, partial);
	}



	@Get()
	@ApiOperation({
		operationId: "getAllAssessmentsForAssignment",
		summary: "Get assessments of assignment",
		description: "Retrieves all assessments that have been created for the assignment."
	})
	getAllAssessmentsForAssignment(
		@Param("courseId") courseId: string,
		@Param("assignmentId", ParseUUIDPipe) assignmentId: string
	): Promise<AssessmentDto[]> {

		// TODO: Check if user is allowed to request all assessments
		return this.assessmentService.getAssessmentsForAssignment(assignmentId);
	}

	@Get(":assessmentId")
	@ApiOperation({
		operationId: "getAssessmentById",
		summary: "Get assessment",
		description: "Retrieves the assessment."
	})
	getAssessmentById(
		@Param("courseId") courseId: string,
		@Param("assignmentId", ParseUUIDPipe) assignmentId: string,
		@Param("assessmentId", ParseUUIDPipe) assessmentId: string
	): Promise<AssessmentDto> {

		return this.assessmentService.getAssessmentById(assessmentId);
	}

	@Patch(":assessmentId")
	@ApiOperation({
		operationId: "updateAssessment",
		summary: "Update assessment",
		description: "Updates the assessment."
	})
	updateAssessment(
		@Param("courseId") courseId: string,
		@Param("assignmentId", ParseUUIDPipe) assignmentId: string,
		@Param("assessmentId", ParseUUIDPipe) assessmentId: string,
		@Body() assessmentDto: AssessmentDto
	): Promise<AssessmentDto> {

		return this.assessmentService.updateAssessment(assessmentId, assessmentDto);
	}

	@Delete(":assessmentId")
	@ApiOperation({
		operationId: "deleteAssessment",
		summary: "Delete assessment",
		description: "Deletes the assessment. Returns true, if removal was successful."
	})
	deleteAssessment(
		@Param("courseId") courseId: string,
		@Param("assignmentId", ParseUUIDPipe) assignmentId: string,
		@Param("assessmentId", ParseUUIDPipe) assessmentId: string
	): Promise<boolean> {

		return this.assessmentService.deleteAssessment(assessmentId);
	}

}
