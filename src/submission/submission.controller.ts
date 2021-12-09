import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CourseMemberGuard } from "../course/guards/course-member/course-member.guard";
import { TeachingStaffGuard } from "../course/guards/teaching-staff.guard";
import { IdentityGuard } from "../user/guards/identity.guard";
import { PaginatedResult } from "../utils/http-utils";
import { SubmissionCreateDto, SubmissionDto } from "./submission.dto";
import { SubmissionFilter } from "./submission.filter";
import { SubmissionService } from "./submission.service";

@ApiBearerAuth()
@ApiTags("submission")
@Controller("courses/:courseId/submissions")
@UseGuards(AuthGuard, CourseMemberGuard)
export class SubmissionController {
	constructor(private readonly service: SubmissionService) {}

	@ApiOperation({
		operationId: "add",
		summary: "Add submission",
		description: "Adds a submission for the specified assignment."
	})
	@Post("assignments/:assignmentId")
	@UseGuards(TeachingStaffGuard)
	add(
		@Param("courseId") courseId: string,
		@Param("assignmentId") assignmentId: string,
		@Body() submission: SubmissionCreateDto
	): Promise<SubmissionDto> {
		return this.service.add(courseId, assignmentId, submission);
	}

	@ApiOperation({
		operationId: "getLatestSubmissionOfAssignment",
		summary: "Get latest submission of assignment.",
		description:
			"Retrieves the latest submission of a user or their group for a specific assignment."
	})
	@Get("users/:userId/assignments/:assignmentId")
	@UseGuards(IdentityGuard)
	getLatestSubmissionOfAssignment(
		@Param("courseId") courseId: string,
		@Param("userId") userId: string,
		@Param("assignmentId") assignmentId: string
	): Promise<SubmissionDto> {
		return this.service.getLatestSubmissionOfAssignment(userId, assignmentId);
	}

	@ApiOperation({
		operationId: "getAllSubmissionsOfUser",
		summary: "Get all submissions of user.",
		description:
			"Retrieves all submissions for an assignment that were submitted by this user (does not include submissions of group members)."
	})
	@Get("users/:userId")
	@UseGuards(TeachingStaffGuard)
	getAllSubmissionsOfUser(
		@Param("courseId") courseId: string,
		@Param("userId") userId: string,
		@Req() request: Request
	): Promise<SubmissionDto[]> {
		return PaginatedResult(this.service.getAllSubmissionsOfUser(courseId, userId), request);
	}

	@ApiOperation({
		operationId: "getAllSubmissionsOfAssignmentOfGroup",
		summary: "Get all submissions of assignment of group.",
		description: "Retrieves all submissions of a group for a specific assignment."
	})
	@Get("groups/:groupId/assignments/:assignmentId")
	@UseGuards(TeachingStaffGuard)
	getAllSubmissionsOfAssignmentOfGroup(
		@Param("courseId") courseId: string,
		@Param("groupId") groupId: string,
		@Param("assignmentId") assignmentId: string,
		@Req() request: Request
	): Promise<SubmissionDto[]> {
		return PaginatedResult(
			this.service.getAllSubmissionsOfAssignmentOfGroup(courseId, groupId, assignmentId),
			request
		);
	}

	@ApiOperation({
		operationId: "getAllSubmissions",
		summary: "Get all submissions.",
		description: "Retrieves all submissions that match the given filter."
	})
	@Get()
	@UseGuards(TeachingStaffGuard)
	getAllSubmissions(
		@Param("courseId") courseId: string,
		@Req() request: Request,
		@Query() filter?: SubmissionFilter
	): Promise<SubmissionDto[]> {
		return PaginatedResult(
			this.service.getAllSubmissions(courseId, new SubmissionFilter(filter)),
			request
		);
	}

	@ApiOperation({
		operationId: "removeAllSubmissionsOfAssignment",
		summary: "Remove all submissions of assignment",
		description: "Removes all submissions of an assignment."
	})
	@Delete("assignments/:assignmentId")
	@UseGuards(TeachingStaffGuard)
	removeAllSubmissionsOfAssignment(
		@Param("courseId") courseId: string,
		@Param("assignmentId") assignmentId: string
	): Promise<void> {
		return this.service.removeAllSubmissionsOfAssignment(assignmentId);
	}
}
