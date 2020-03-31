import { Controller, Get, Param, Post, Body, ParseUUIDPipe, Patch, Delete, Query, ValidationPipe } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CourseService } from "../services/course.service";
import { CourseDto } from "../../shared/dto/course.dto";
import { UserDto } from "../../shared/dto/user.dto";
import { CourseFilterDto } from "../../shared/dto/course-filter.dto";
import { ChangeCourseRoleDto } from "../dto/change-course-role.dto";

@ApiTags("courses") 
@Controller("courses")
export class CourseController {

	constructor(private courseService: CourseService) { }

	/**
	 * Creates a new course.
	 */
	@Post()
	createCourse(@Body() courseDto: CourseDto): Promise<CourseDto> {
		return this.courseService.createCourse(courseDto);
	}

	/**
	 * Adds a user to the course. 
	 * If the course requires a password, the correct password needs to be included in the request body.
	 */
	@Post(":courseId/users/:userId")
	addUser(@Param("courseId") courseId: string,
			@Param("userId", ParseUUIDPipe) userId: string,
			@Body("password") password?: string,
	): Promise<any> {
		return this.courseService.addUser(courseId, userId, password);
	}
	
	/**
	 * Returns all courses that match the given filter.
	 */
	@Get()
	getCourses(@Query() filter?: CourseFilterDto): Promise<CourseDto[]> {
		return this.courseService.getCourses(filter);
	}

	/**
	 * Returns the course.
	 */
	@Get(":courseId")
	getCourseById(@Param("courseId") courseId: string): Promise<CourseDto> {
		return this.courseService.getCourseById(courseId);
	}

	/**
	 * Returns the course.
	 */
	@Get(":name/semester/:semester")
	getCourseByNameAndSemester(
		@Param("name") name: string,
		@Param("semester") semester: string
	): Promise<CourseDto> {

		return this.courseService.getCourseByNameAndSemester(name, semester);
	}

	/**
	 * Returns a collection of users that a signed up for this course.
	 */
	@Get(":courseId/users")
	getUsersOfCourse(@Param("courseId") courseId: string): Promise<UserDto[]> {
		return this.courseService.getUsersOfCourse(courseId);
	}

	/**
	 * Updates the course.
	 */
	@Patch(":courseId")
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
	updateUserRole(
		@Param("courseId") courseId: string,
		@Param("userId", ParseUUIDPipe) userId: string,
		@Body(ValidationPipe) dto: ChangeCourseRoleDto
	): Promise<boolean> {
		
		return this.courseService.updateRole(courseId, userId, dto.role);
	}

	/**
	 * Deletes the course.
	 */
	@Delete(":courseId")
	deleteCourse(
		@Param("courseId") courseId: string,
	): Promise<boolean> {

		return this.courseService.deleteCourse(courseId);
	}

	@Delete(":courseId/users/:userId")
	@ApiOperation({ description: "Removes the user from the course. Returns true, if removal was successful." })
	removeUser(
		@Param("courseId") courseId: string,
		@Param("userId", ParseUUIDPipe) userId: string,
	): Promise<boolean> {

		return this.courseService.removeUser(courseId, userId);
	}

}
