import { Controller, Get, Param, Post, Body, Patch, Delete, Query, ValidationPipe, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CourseService } from "../services/course.service";
import { CourseDto } from "../dto/course/course.dto";
import { UserDto } from "../../shared/dto/user.dto";
import { CourseFilterDto } from "../dto/course/course-filter.dto";
import { ChangeCourseRoleDto } from "../dto/change-course-role.dto";
import { CourseCreateDto } from "../dto/course/course-create.dto";
import { PasswordDto } from "../../shared/dto/password.dto";
import { CanJoinCourseQuery } from "../queries/can-join-course/can-join-course.query";
import { QueryBus } from "@nestjs/cqrs";
import { AuthGuard } from "@nestjs/passport";
import { CourseMemberGuard } from "../guards/course-member.guard";
import { CanJoinCourseDto } from "../queries/can-join-course/can-join-course.dto";
import { Request } from "express";
import { AssignedEvaluatorFilter } from "../queries/groups-with-assigned-evaluator/group-with-assigned-evaluator.dto";
import { UserWithAssignedEvaluatorDto } from "../queries/users-with-assigned-evaluator/user-with-assigned-evaluator.dto";
import { UsersWithAssignedEvaluatorQuery } from "../queries/users-with-assigned-evaluator/users-with-assigned-evaluator.query";
import { setTotalCountHeader, sanitizeEnum } from "../../../test/utils/http-utils";
import { CourseParticipantsFilter } from "../dto/course/course-participants.filter";
import { CourseRole } from "../../shared/enums";

@ApiTags("courses") 
@Controller("courses")
export class CourseController {

	constructor(private courseService: CourseService,
				private queryBus: QueryBus) { }

	/**
	 * Creates a new course.
	 */
	@Post()
	@ApiOperation({
		operationId: "createCourse",
		summary: "Create course",
		description: "Creates a new course."
	})
	createCourse(@Body() courseDto: CourseCreateDto): Promise<CourseDto> {
		return this.courseService.createCourse(courseDto);
	}

	/**
	 * Adds a user to the course. 
	 * If the course requires a password, the correct password needs to be included in the request body.
	 */
	@Post(":courseId/users/:userId")
	@ApiOperation({
		operationId: "addUser",
		summary: "Add user to course",
		description: "Adds a user to the course. If the course requires a password, the correct password needs to be included in the request body."
	})
	addUser(@Param("courseId") courseId: string,
			@Param("userId") userId: string,
			@Body() password?: PasswordDto,
	): Promise<any> {
		return this.courseService.addUser(courseId, userId, password.password);
	}
	
	/**
	 * Returns all courses that match the given filter.
	 */
	@Get()
	@ApiOperation({
		operationId: "getCourses",
		summary: "Get courses",
		description: "Returns all courses that match the given filter."
	})
	getCourses(@Query() filter?: CourseFilterDto): Promise<CourseDto[]> {
		return this.courseService.getCourses(filter);
	}

	/**
	 * Returns the course.
	 */
	@Get(":courseId")
	@UseGuards(AuthGuard(), CourseMemberGuard)
	@ApiOperation({
		operationId: "getCourseById",
		summary: "Get course",
		description: "Retrieves the course, if the requesting user is a member of this course."
	})
	getCourseById(@Param("courseId") courseId: string): Promise<CourseDto> {
		return this.courseService.getCourseById(courseId);
	}


	/**
	 * Returns the course.
	 */
	@Get(":name/semester/:semester")
	@ApiOperation({
		operationId: "getCourseByNameAndSemester",
		summary: "Get course by name and semester",
		description: ""
	})
	getCourseByNameAndSemester(
		@Param("name") name: string,
		@Param("semester") semester: string
	): Promise<CourseDto> {

		return this.courseService.getCourseByNameAndSemester(name, semester);
	}

	/**
	 * Returns a collection of users that are signed up for this course.
	 */
	@Get(":courseId/users")
	@ApiOperation({
		operationId: "getUsersOfCourse",
		summary: "Get users of course",
		description: "Returns a collection of users that are signed up for this course."
	})
	async getUsersOfCourse(
		@Req() request: Request,
		@Param("courseId") courseId: string,
		@Query() filter?: CourseParticipantsFilter
	): Promise<UserDto[]> {
		filter.courseRole = sanitizeEnum(CourseRole, filter.courseRole);
		
		const [users, count] = await this.courseService.getUsersOfCourse(courseId, filter);
		setTotalCountHeader(request, count);
		return users;
	}

	@Get(":courseId/users/assignments/:assignmentId/with-assigned-evaluator")
	@ApiOperation({
		operationId: "getUsersWithAssignedEvaluator",
		summary: "Get users with assigned evaluator",
		description: "Returns users with their assigned evaluator for a particular assignment."
	})
	async getUsersWithAssignedEvaluator(
		@Req() request: Request,
		@Param("courseId") courseId: string,
		@Param("assignmentId") assignmentId: string,
		@Query() filter?: AssignedEvaluatorFilter
	): Promise<UserWithAssignedEvaluatorDto[]> {
		const [users, count] = await this.queryBus.execute(
			new UsersWithAssignedEvaluatorQuery(courseId, assignmentId, new AssignedEvaluatorFilter(filter))
		);
		setTotalCountHeader(request, count);
		return users;
	}

	@Get(":courseId/users/:userId/canJoin")
	@ApiOperation({
		operationId: "canUserJoinCourse",
		summary: "Check if joining is possible",
		description: "Checks, if the user is able to join the course. A user can join a course, if he's not already a member and the course is not closed."
	})
	canUserJoinCourse(
		@Param("courseId") courseId: string,
		@Param("userId") userId: string,
	): Promise<CanJoinCourseDto> {

		return this.queryBus.execute(new CanJoinCourseQuery(courseId, userId));
	}

	/**
	 * Updates the course.
	 */
	@Patch(":courseId")
	@ApiOperation({
		operationId: "updateCourse",
		summary: "Update course",
		description: "Updates the course."
	})
	updateCourse(
		@Param("courseId") courseId: string,
		@Body() courseDto: CourseDto
	): Promise<CourseDto> {

		return this.courseService.updateCourse(courseId, courseDto);
	}

	/**
	 * Assigns the given role to the user of this course.
	 */
	@Patch(":courseId/users/:userId/role")
	@ApiOperation({
		operationId: "updateUserRole",
		summary: "Update user's role in course",
		description: "Assigns the given role to the user of this course."
	})
	updateUserRole(
		@Param("courseId") courseId: string,
		@Param("userId") userId: string,
		@Body(ValidationPipe) dto: ChangeCourseRoleDto
	): Promise<boolean> {
		
		return this.courseService.updateRole(courseId, userId, dto.role);
	}

	/**
	 * Deletes the course.
	 */
	@Delete(":courseId")
	@ApiOperation({
		operationId: "deleteCourse",
		summary: "Delete course",
		description: "Deletes the course."
	})
	deleteCourse(
		@Param("courseId") courseId: string,
	): Promise<boolean> {

		return this.courseService.deleteCourse(courseId);
	}

	/**
	 * Removes the user from the course. Returns true, if removal was successful.
	 */
	@Delete(":courseId/users/:userId")
	@ApiOperation({
		operationId: "removeUser",
		summary: "Remove user from course",
		description: "Removes the user from the course. Returns true, if removal was successful."
	})
	removeUser(
		@Param("courseId") courseId: string,
		@Param("userId") userId: string,
	): Promise<boolean> {

		return this.courseService.removeUser(courseId, userId);
	}

}
