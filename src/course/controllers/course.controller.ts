import { Controller, Get, Param, ParseIntPipe, Post, Body, ParseUUIDPipe } from '@nestjs/common';
import { CourseService } from '../services/course.service';
import { CourseDto } from '../../shared/dto/course.dto';
import { GroupDto } from '../../shared/dto/group.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("courses")
@Controller('courses')
export class CourseController {
	constructor(private courseService: CourseService) { }

	@Post()
	createCourse(@Body() courseDto: CourseDto): Promise<CourseDto> {
		return this.courseService.createCourse(courseDto);
	}

	@Post(":id/groups")
	createGroup(
		@Param("id", ParseIntPipe) id: number,
		@Body() groupDto: GroupDto) {
		
		return this.courseService.createGroup(id, groupDto);
	}

	@Post(":id/users/:userId")
	addUser(@Param("id", ParseIntPipe) id: number,
			@Param("userId", ParseUUIDPipe) userId: string): Promise<any> {
		return this.courseService.addUser(id, userId);
	}

	@Get()
	getAllCourses(): Promise<CourseDto[]> {
		return this.courseService.getAllCourses();
	}

	@Get(":id")
	getCourseById(@Param("id", ParseIntPipe) id: number): Promise<CourseDto> {
		return this.courseService.getCourseById(id);
	}

	@Get(":name/:semester")
	getCourseByNameAndSemester(
		@Param("name") name: string,
		@Param("semester") semester: string): Promise<CourseDto> {

		return this.courseService.getCourseByNameAndSemester(name, semester);
    }
}
