import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, ValidationPipe, BadRequestException } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from "@nestjs/swagger";
import { Request } from "express";
import { sanitizeEnum, setTotalCountHeader } from "../../../test/utils/http-utils";
import { PasswordDto } from "../../shared/dto/password.dto";
import { UserDto } from "../../shared/dto/user.dto";
import { CourseRole } from "../../shared/enums";
import { ChangeCourseRoleDto } from "../dto/change-course-role.dto";
import { CourseParticipantsFilter } from "../dto/course/course-participants.filter";
import { CanJoinCourseDto } from "../queries/can-join-course/can-join-course.dto";
import { CanJoinCourseQuery } from "../queries/can-join-course/can-join-course.query";
import { AssignedEvaluatorFilter } from "../queries/groups-with-assigned-evaluator/group-with-assigned-evaluator.dto";
import { UserWithAssignedEvaluatorDto } from "../queries/users-with-assigned-evaluator/user-with-assigned-evaluator.dto";
import { UsersWithAssignedEvaluatorQuery } from "../queries/users-with-assigned-evaluator/users-with-assigned-evaluator.query";
import { CourseParticipantsService } from "../services/course-participants.service";
import { ParticipantsComparisonDto } from "../queries/compare-participants-list/participants-comparison.dto";
import { CourseId } from "../entities/course.entity";
import { CompareParticipantsListQuery } from "../queries/compare-participants-list/compare-participants-list.query";
import { transformArray } from "../../utils/http-utils";

@ApiBearerAuth()
@ApiTags("course-participants")
@Controller("courses/:courseId/users")
export class CourseParticipantsController {

	constructor(private courseParticipantsService: CourseParticipantsService,
				private queryBus: QueryBus) { }

	/**
	 * Adds a user to the course. 
	 * If the course requires a password, the correct password needs to be included in the request body.
	 */
	@Post(":userId")
	@ApiOperation({
		operationId: "addUser",
		summary: "Add user to course.",
		description: "Adds a user to the course. If the course requires a password, the correct password needs to be included in the request body."
	})
	addUser(@Param("courseId") courseId: CourseId,
			@Param("userId") userId: string,
			@Body() password?: PasswordDto,
	): Promise<any> {
		return this.courseParticipantsService.addUser(courseId, userId, password.password);
	}

	/**
	 * Returns a collection of users that are signed up for this course.
	 */
	@Get()
	@ApiOperation({
		operationId: "getUsersOfCourse",
		summary: "Get users of course.",
		description: "Returns a collection of users that are signed up for this course."
	})
	async getUsersOfCourse(
		@Req() request: Request,
		@Param("courseId") courseId: CourseId,
		@Query() filter?: CourseParticipantsFilter
	): Promise<UserDto[]> {
		filter.courseRole = sanitizeEnum(CourseRole, filter.courseRole);
		
		const [users, count] = await this.courseParticipantsService.getUsersOfCourse(courseId, filter);
		setTotalCountHeader(request, count);
		return users;
	}

	@Get("compare-participants-list")
	@ApiOperation({
		operationId: "compareParticipantsList",
		summary: "Compare participants list..",
		description: "Returns an Object, which divides the course participants in two groups (in/out)."
	})
	@ApiQuery({ name: "compareToCourseIds", type: String, isArray: true })
	compareParticipantsList(
		@Param("courseId") courseId: CourseId,
		@Query("compareToCourseIds") compareToCourseIds: CourseId[]
	): Promise<ParticipantsComparisonDto> {
		
		compareToCourseIds = transformArray(compareToCourseIds);
		if (compareToCourseIds?.length > 0) {
			return this.queryBus.execute(new CompareParticipantsListQuery(courseId, compareToCourseIds));
		} else {
			throw new BadRequestException("No courseIds were specified for comparison.");
		}
	}

	@Get(":userId/canJoin")
	@ApiOperation({
		operationId: "canUserJoinCourse",
		summary: "Check if joining is possible.",
		description: "Checks, if the user is able to join the course. A user can join a course, if he's not already a member and the course is not closed."
	})
	canUserJoinCourse(
		@Param("courseId") courseId: CourseId,
		@Param("userId") userId: string,
	): Promise<CanJoinCourseDto> {

		return this.queryBus.execute(new CanJoinCourseQuery(courseId, userId));
	}

	@Get("assignments/:assignmentId/with-assigned-evaluator")
	@ApiOperation({
		operationId: "getUsersWithAssignedEvaluator",
		summary: "Get users with assigned evaluator.",
		description: "Returns users with their assigned evaluator for a particular assignment."
	})
	async getUsersWithAssignedEvaluator(
		@Req() request: Request,
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Query() filter?: AssignedEvaluatorFilter
	): Promise<UserWithAssignedEvaluatorDto[]> {
		const [users, count] = await this.queryBus.execute(
			new UsersWithAssignedEvaluatorQuery(courseId, assignmentId, new AssignedEvaluatorFilter(filter))
		);
		setTotalCountHeader(request, count);
		return users;
	}

	/**
	 * Assigns the given role to the user of this course.
	 */
	@Patch(":userId/role")
	@ApiOperation({
		operationId: "updateUserRole",
		summary: "Update user's role in course.",
		description: "Assigns the given role to the user of this course."
	})
	updateUserRole(
		@Param("courseId") courseId: CourseId,
		@Param("userId") userId: string,
		@Body(ValidationPipe) dto: ChangeCourseRoleDto
	): Promise<boolean> {
		
		return this.courseParticipantsService.updateRole(courseId, userId, dto.role);
	}

	/**
	 * Removes the user from the course. Returns true, if removal was successful.
	 */
	@Delete(":userId")
	@ApiOperation({
		operationId: "removeUser",
		summary: "Remove user from course.",
		description: "Removes the user from the course. Returns true, if removal was successful."
	})
	removeUser(
		@Param("courseId") courseId: CourseId,
		@Param("userId") userId: string,
	): Promise<boolean> {

		return this.courseParticipantsService.removeUser(courseId, userId);
	}

}
