import { Controller, Post, Body, Get, Param, Delete, Patch } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { UserDto } from "../../shared/dto/user.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CourseDto } from "src/course/dto/course/course.dto";
import { AssessmentDto } from "../../course/dto/assessment/assessment.dto";
import { GroupDto } from "../../course/dto/group/group.dto";

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
	getCoursesOfUser(@Param("userId") userId: string): Promise<CourseDto[]> {
		return this.userService.getCoursesOfUser(userId);
	}

	@Get(":userId/courses/:courseId/groups")
	@ApiOperation({
		operationId: "getGroupsOfUserForCourse",
		summary: "Get groups of user for course",
		description: "Retrieves all groups that the user is a member of in a course."
	})
	getGroupsOfUserForCourse(
		@Param("userId") userId: string,
		@Param("courseId") courseId: string,
	): Promise<GroupDto[]> {

		return this.userService.getGroupsOfUserForCourse(userId, courseId);
	}

	@Get(":userId/courses/:courseId/assessments")
	@ApiOperation({
		operationId: "getAssessmentsOfUserForCourse",
		summary: "Get assessments",
		description: "Returns all assessments of the user in the given course. Includes the group, if assessment specified a group."
	})
	getAssessmentsWithGroupsOfUserForCourse(
		@Param("userId") userId: string,
		@Param("courseId") courseId: string,
	): Promise<AssessmentDto[]> {

		return this.userService.getAssessmentsOfUserForCourse(userId, courseId);
	}

	@Patch(":userId")
	@ApiOperation({
		operationId: "updateUser",
		summary: "Update user",
		description: "Updates the user"
	})
	updateUser(
		@Param("userId") userId: string,
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
	deleteUser(@Param("userId") userId: string): Promise<boolean> {
		return this.userService.deleteUser(userId);
	}
}
