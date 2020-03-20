import { Controller, Get, Param, Post, Body, ParseUUIDPipe, Patch, Delete, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CourseService } from "../services/course.service";
import { CourseDto } from "../../shared/dto/course.dto";
import { UserDto } from "../../shared/dto/user.dto";
import { CourseRole } from "../../shared/enums";
import { CourseFilterDto } from "../../shared/dto/course-filter.dto";

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
		@Body("role") role: CourseRole
	): Promise<boolean> {

		return this.courseService.updateRole(courseId, userId, role);
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

}
