import { Controller, Post, Body, Get, Param, ParseUUIDPipe, Delete, Patch } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { UserDto } from "../../shared/dto/user.dto";
import { ApiTags } from "@nestjs/swagger";
import { CourseDto } from "src/shared/dto/course.dto";
import { AssessmentDto } from "../../shared/dto/assessment.dto";
import { GroupDto } from "../../shared/dto/group.dto";

@ApiTags("users")
@Controller("users")
export class UserController {

	constructor(private userService: UserService) { }

	@Post()
	createUser(@Body() userDto: UserDto): Promise<UserDto> {
		return this.userService.createUser(userDto);
	}

	@Get()
	getAllUsers(): Promise<UserDto[]> {
		return this.userService.getAllUsers();
	}

	@Get(":userId")
	getUserById(@Param("userId") userId: string): Promise<UserDto> {
		return this.userService.getUserById(userId);
	}

	@Get("email/:email")
	getUserbyEmail(@Param("email") email: string): Promise<UserDto> {
		return this.userService.getUserByEmail(email);
	}


	@Get(":userId/courses")
	getCoursesOfUser(@Param("userId", ParseUUIDPipe) userId: string): Promise<CourseDto[]> {
		return this.userService.getCoursesOfUser(userId);
	}

	/**
	 *	Returns a collection of all groups the user is part of in the given course.
	 *	
	 * @param {string} userId
	 * @param {string} courseId
	 * @returns {Promise<GroupDto[]>}
	 * @memberof UserController
	 */
	@Get(":userId/courses/:courseId/groups")
	getGroupsOfUserForCourse(
		@Param("userId", ParseUUIDPipe) userId: string,
		@Param("courseId") courseId: string,
	): Promise<GroupDto[]> {

		return this.userService.getGroupsOfUserForCourse(userId, courseId);
	}

	@Get(":userId/courses/:courseId/assessmentsWithGroups")
	getAssessmentsWithGroupsOfUserForCourse(
		@Param("userId", ParseUUIDPipe) userId: string,
		@Param("courseId") courseId: string,
	): Promise<AssessmentDto[]> {

		return this.userService.getAssessmentsWithGroupsOfUserForCourse(userId, courseId);
	}

	@Patch(":userId")
	updateUser(
		@Param("userId", ParseUUIDPipe) userId: string,
		@Body() userDto: UserDto
	): Promise<UserDto> {
		return this.userService.updateUser(userId, userDto);
	}

	@Delete(":userId")
	deleteUser(@Param("userId", ParseUUIDPipe) userId: string): Promise<boolean> {
		return this.userService.deleteUser(userId);
	}
}
