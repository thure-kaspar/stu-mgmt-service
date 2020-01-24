import { Controller, Get, Param, ParseIntPipe, Post, Body, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CourseService } from '../services/course.service';
import { CourseDto } from '../../shared/dto/course.dto';
import { GroupDto } from '../../shared/dto/group.dto';
import { GroupService } from '../services/group.service';

@ApiTags("courses")
@Controller("courses")
export class CourseController {
	constructor(private courseService: CourseService,
				private groupService: GroupService) { }

	@Post()
	createCourse(@Body() courseDto: CourseDto): Promise<CourseDto> {
		return this.courseService.createCourse(courseDto);
	}

	@Post(":name/:semester/groups")
	createGroup(
		@Param("name") name: string,
		@Param("semester") semester: string,
		@Body() groupDto: GroupDto
	): Promise<any>  {
		
		return this.groupService.createGroup(name, semester, groupDto);
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
		@Param("semester") semester: string
	): Promise<CourseDto> {

		return this.courseService.getCourseByNameAndSemester(name, semester);
	}

	@Get(":name/:semester/groups")
	getGroupsOfCourse(
		@Param("name") name: string,
		@Param("semester") semester: string
	): Promise<GroupDto[]> {
		
		return this.groupService.getGroupsOfCourse(name, semester);
	}

}
