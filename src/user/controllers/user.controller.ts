import { Controller, Post, Body, Get, Param, ParseUUIDPipe, Delete, Patch } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { UserDto } from "../../shared/dto/user.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CourseDto } from "src/shared/dto/course.dto";
import { AssessmentDto } from "../../shared/dto/assessment.dto";
import { GroupDto } from "../../shared/dto/group.dto";

@ApiTags("users")
@Controller("users")
export class UserController {

	constructor(private userService: UserService) { }

	@Post()
	@ApiOperation({
		operationId: "createUser",
		summary: "Create user",
		description: "Creates a user."
	})
	createUser(@Body() userDto: UserDto): Promise<UserDto> {
		return this.userService.createUser(userDto);
	}

	@Get()
	@ApiOperation({
		operationId: "getAllUsers",
		summary: "Get users",
		description: "Retrieves all users that match the specified filter."
	})
	getUsers(): Promise<UserDto[]> {
		return this.userService.getAllUsers();
	}

	@Get(":userId")
	@ApiOperation({
		operationId: "getUserById",
		summary: "Get user",
		description: "Retrieves the user."
	})
	getUserById(@Param("userId") userId: string): Promise<UserDto> {
		return this.userService.getUserById(userId);
	}

	@Get("email/:email")
	@ApiOperation({
		operationId: "getUserbyEmail",
		summary: "Get user by email",
		description: "Retrieves a user by email."
	})
	getUserbyEmail(@Param("email") email: string): Promise<UserDto> {
		return this.userService.getUserByEmail(email);
	}

	@Get(":userId/courses")
	@ApiOperation({
		operationId: "getCoursesOfUser",
		summary: "Get courses of user",
		description: "Retrieves all courses that the user is a member of."
	})
	getCoursesOfUser(@Param("userId", ParseUUIDPipe) userId: string): Promise<CourseDto[]> {
		return this.userService.getCoursesOfUser(userId);
	}

	@Get(":userId/courses/:courseId/groups")
	@ApiOperation({
		operationId: "getGroupsOfUserForCourse",
		summary: "Get groups of user for course",
		description: "Retrieves all groups that the user is a member of in a course."
	})
	getGroupsOfUserForCourse(
		@Param("userId", ParseUUIDPipe) userId: string,
		@Param("courseId") courseId: string,
	): Promise<GroupDto[]> {

		return this.userService.getGroupsOfUserForCourse(userId, courseId);
	}

	@Get(":userId/courses/:courseId/assessmentsWithGroups")
	@ApiOperation({
		operationId: "getAssessmentsWithGroupsOfUserForCourse",
		summary: "TODO",
		description: ""
	})
	getAssessmentsWithGroupsOfUserForCourse(
		@Param("userId", ParseUUIDPipe) userId: string,
		@Param("courseId") courseId: string,
	): Promise<AssessmentDto[]> {

		return this.userService.getAssessmentsWithGroupsOfUserForCourse(userId, courseId);
	}

	@Patch(":userId")
	@ApiOperation({
		operationId: "updateUser",
		summary: "Update user",
		description: "Updates the user"
	})
	updateUser(
		@Param("userId", ParseUUIDPipe) userId: string,
		@Body() userDto: UserDto
	): Promise<UserDto> {
		return this.userService.updateUser(userId, userDto);
	}

	@Delete(":userId")
	@ApiOperation({
		operationId: "deleteUser",
		summary: "Delete user",
		description: "Deletes the user. Returns true, if removes was successful."
	})
	deleteUser(@Param("userId", ParseUUIDPipe) userId: string): Promise<boolean> {
		return this.userService.deleteUser(userId);
	}
}
