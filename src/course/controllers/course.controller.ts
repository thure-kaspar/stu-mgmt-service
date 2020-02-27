import { Controller, Get, Param, Post, Body, ParseUUIDPipe, Patch, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CourseService } from '../services/course.service';
import { CourseDto } from '../../shared/dto/course.dto';
import { UserDto } from "../../shared/dto/user.dto";
import { UserRoles } from '../../shared/enums';
import { CourseFilterDto } from '../../shared/dto/course-filter.dto';

@ApiTags("courses") 
@Controller("courses")
export class CourseController {
	constructor(private courseService: CourseService) { }

	@Post()
	createCourse(@Body() courseDto: CourseDto): Promise<CourseDto> {
		return this.courseService.createCourse(courseDto);
	}

	@Post(":courseId/users/:userId")
	addUser(@Param("courseId") courseId: string,
			@Param("userId", ParseUUIDPipe) userId: string): Promise<any> {
		return this.courseService.addUser(courseId, userId);
	}
	
	@Get()
	getCourses(@Body() filter?: CourseFilterDto): Promise<CourseDto[]> {
		return this.courseService.getCourses(filter);
	}

	@Get(":courseId")
	getCourseById(@Param("courseId") courseId: string): Promise<CourseDto> {
		return this.courseService.getCourseById(courseId);
	}

	@Get(":name/semester/:semester")
	getCourseByNameAndSemester(
		@Param("name") name: string,
		@Param("semester") semester: string
	): Promise<CourseDto> {

		return this.courseService.getCourseByNameAndSemester(name, semester);
	}

	@Get(":courseId/users")
	getUsersOfCourse(@Param("courseId") courseId: string): Promise<UserDto[]> {
		return this.courseService.getUsersOfCourse(courseId);
	}

	@Patch(":courseId")
	updateCourse(
		@Param("courseId") courseId: string,
		@Body() courseDto: CourseDto
	): Promise<CourseDto> {

		return this.courseService.updateCourse(courseId, courseDto);
	}

	@Patch(":courseId/users/:userId/role")
	updateUserRole(
		@Param("courseId") courseId: string,
		@Param("userId", ParseUUIDPipe) userId: string,
		@Body("role") role: UserRoles
	): Promise<boolean> {

		return this.courseService.updateUserRole(courseId, userId, role);
	}

	@Delete(":courseId")
	deleteCourse(
		@Param("courseId") courseId: string,
	): Promise<boolean> {

		return this.courseService.deleteCourse(courseId);
	}

}
