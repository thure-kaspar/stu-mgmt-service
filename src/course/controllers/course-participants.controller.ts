import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
	ValidationPipe
} from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { setTotalCountHeader } from "../../../test/utils/http-utils";
import { PasswordDto } from "../../shared/dto/password.dto";
import { UserId } from "../../shared/entities/user.entity";
import { PaginatedResult, throwIfRequestFailed, transformArray } from "../../utils/http-utils";
import { ChangeCourseRoleDto } from "../dto/change-course-role.dto";
import { CourseParticipantsFilter } from "../dto/course-participant/course-participants.filter";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { CourseId } from "../entities/course.entity";
import { CourseMemberGuard } from "../guards/course-member.guard";
import { ParticipantIdentityGuard } from "../guards/identity.guard";
import { TeachingStaffGuard } from "../guards/teaching-staff.guard";
import { CanJoinCourseDto } from "../queries/can-join-course/can-join-course.dto";
import { CanJoinCourseQuery } from "../queries/can-join-course/can-join-course.query";
import { CompareParticipantsListQuery } from "../queries/compare-participants-list/compare-participants-list.query";
import { ParticipantsComparisonDto } from "../queries/compare-participants-list/participants-comparison.dto";
import { AssignedEvaluatorFilter } from "../../assessment/queries/groups-with-assigned-evaluator/group-with-assigned-evaluator.dto";
import { CourseParticipantsService } from "../services/course-participants.service";
import { GetParticipant } from "../decorators/decorators";
import { Participant } from "../models/participant.model";
import { ParticipantsWithAssignedEvaluatorDto } from "../../assessment/queries/participants-with-assigned-evaluator/participants-with-assigned-evaluator.dto";
import { ParticipantsWithAssignedEvaluatorQuery } from "../../assessment/queries/participants-with-assigned-evaluator/participants-with-assigned-evaluator.query";
import { AuthGuard } from "../../auth/guards/auth.guard";

@ApiBearerAuth()
@ApiTags("course-participants")
@Controller("courses/:courseId/users")
@UseGuards(AuthGuard)
export class CourseParticipantsController {
	constructor(
		private courseParticipantsService: CourseParticipantsService,
		private queryBus: QueryBus
	) {}

	/**
	 * Adds a user to the course.
	 * If the course requires a password, the correct password needs to be included in the request body.
	 */
	@Post(":userId")
	@ApiOperation({
		operationId: "addUser",
		summary: "Add user to course.",
		description:
			"Adds a user to the course. If the course requires a password, the correct password needs to be included in the request body."
	})
	addUser(
		@Param("courseId") courseId: CourseId,
		@Param("userId") userId: UserId,
		@Body() password?: PasswordDto
	): Promise<void> {
		return this.courseParticipantsService.addParticipant(courseId, userId, password.password);
	}

	/**
	 * Returns a collection of users that are signed up for this course.
	 */
	@ApiOperation({
		operationId: "getUsersOfCourse",
		summary: "Get users of course.",
		description: "Returns a collection of users that are signed up for this course."
	})
	@Get()
	@UseGuards(CourseMemberGuard, TeachingStaffGuard)
	async getUsersOfCourse(
		@Req() request: Request,
		@Param("courseId") courseId: CourseId,
		@Query() filter?: CourseParticipantsFilter
	): Promise<ParticipantDto[]> {
		return PaginatedResult(
			this.courseParticipantsService.getParticipants(
				courseId,
				new CourseParticipantsFilter(filter)
			),
			request
		);
	}

	@ApiOperation({
		operationId: "getParticipantsByMatrNr",
		summary: "Get participants of course by matrNr.",
		description:
			"Returns participants by their matrNr. The response only includes participants that were found, meaning unknown matrNrs will be ignored."
	})
	@ApiQuery({ name: "matrNr", type: Number, isArray: true })
	@Get("matrNrs")
	@UseGuards(CourseMemberGuard, TeachingStaffGuard)
	async getParticipantsByMatrNr(
		@Param("courseId") courseId: CourseId,
		@Query("matrNr") matrNr: number[]
	): Promise<ParticipantDto[]> {
		if (!(matrNr?.length > 0)) {
			return [];
		}

		return this.courseParticipantsService.getParticipantsByMatrNr(
			courseId,
			transformArray(matrNr).map(str => Number(str))
		);
	}

	@ApiOperation({
		operationId: "getParticipant",
		summary: "Get participant.",
		description:
			"Retrieves a specific participant and course related information about the participant."
	})
	@UseGuards(CourseMemberGuard)
	@Get(":userId")
	async getParticipant(
		@Param("courseId") courseId: CourseId,
		@Param("userId") userId: UserId,
		@GetParticipant() requestingParticipant: Participant
	): Promise<ParticipantDto> {
		const participant = await this.courseParticipantsService.getParticipant(courseId, userId);
		if (requestingParticipant.isStudent() && requestingParticipant.userId !== userId) {
			participant.email = undefined;
		}
		return participant;
	}

	@ApiOperation({
		operationId: "compareParticipantsList",
		summary: "Compare participants list..",
		description:
			"Returns an Object, which divides the course participants in two groups (in/out)."
	})
	@Get("query/compare-participants-list")
	@UseGuards(CourseMemberGuard, TeachingStaffGuard)
	@ApiQuery({ name: "compareToCourseIds", type: String, isArray: true })
	compareParticipantsList(
		@Param("courseId") courseId: CourseId,
		@Query("compareToCourseIds") compareToCourseIds: CourseId[]
	): Promise<ParticipantsComparisonDto> {
		compareToCourseIds = transformArray(compareToCourseIds);
		if (compareToCourseIds?.length > 0) {
			return this.queryBus.execute(
				new CompareParticipantsListQuery(courseId, compareToCourseIds)
			);
		} else {
			throw new BadRequestException("No courseIds were specified for comparison.");
		}
	}

	@ApiOperation({
		operationId: "canUserJoinCourse",
		summary: "Check if joining is possible.",
		description:
			"Checks, if the user is able to join the course. A user can join a course, if he's not already a member and the course is not closed."
	})
	@Get(":userId/canJoin")
	canUserJoinCourse(
		@Param("courseId") courseId: CourseId,
		@Param("userId") userId: UserId
	): Promise<CanJoinCourseDto> {
		return this.queryBus.execute(new CanJoinCourseQuery(courseId, userId));
	}

	@ApiOperation({
		operationId: "getParticipantsWithAssignedEvaluator",
		summary: "Get participants with assigned evaluator.",
		description:
			"Returns participants with their assigned evaluator for a particular assignment."
	})
	@UseGuards(CourseMemberGuard, TeachingStaffGuard)
	@Get("assignments/:assignmentId/with-assigned-evaluator")
	async getParticipantsWithAssignedEvaluator(
		@Req() request: Request,
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Query() filter?: AssignedEvaluatorFilter
	): Promise<ParticipantsWithAssignedEvaluatorDto[]> {
		const [users, count] = await this.queryBus.execute(
			new ParticipantsWithAssignedEvaluatorQuery(
				courseId,
				assignmentId,
				new AssignedEvaluatorFilter(filter)
			)
		);
		setTotalCountHeader(request, count);
		return users;
	}

	/**
	 * Assigns the given role to the user of this course.
	 */
	@ApiOperation({
		operationId: "updateUserRole",
		summary: "Update user's role in course.",
		description: "Assigns the given role to the user of this course."
	})
	@UseGuards(CourseMemberGuard, TeachingStaffGuard)
	@Patch(":userId/role")
	async updateUserRole(
		@Param("courseId") courseId: CourseId,
		@Param("userId") userId: UserId,
		@Body(ValidationPipe) dto: ChangeCourseRoleDto
	): Promise<void> {
		const updated = await this.courseParticipantsService.updateRole(courseId, userId, dto.role);
		if (!updated) {
			throw new BadRequestException("Update failed");
		}
	}

	/**
	 * Removes the user from the course. Returns true, if removal was successful.
	 */
	@ApiOperation({
		operationId: "removeUser",
		summary: "Remove user from course.",
		description: "Removes the user from the course. Returns true, if removal was successful."
	})
	@UseGuards(CourseMemberGuard, ParticipantIdentityGuard)
	@Delete(":userId")
	async removeUser(
		@Param("courseId") courseId: CourseId,
		@Param("userId") userId: UserId
	): Promise<void> {
		return throwIfRequestFailed(
			this.courseParticipantsService.removeUser(courseId, userId),
			`Failed to remove user (${userId}) from course (${courseId}).`
		);
	}
}
