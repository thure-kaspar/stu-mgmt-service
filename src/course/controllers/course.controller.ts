import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CourseCreateDto } from "../dto/course/course-create.dto";
import { CourseFilter } from "../dto/course/course-filter.dto";
import { CourseDto } from "../dto/course/course.dto";
import { CourseMemberGuard } from "../guards/course-member.guard";
import { CourseService } from "../services/course.service";
import { CourseId } from "../entities/course.entity";
import { throwIfRequestFailed } from "../../utils/http-utils";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserRole } from "../../shared/enums";

@ApiBearerAuth()
@ApiTags("courses") 
@Controller("courses")
export class CourseController {

	constructor(private courseService: CourseService,
				private queryBus: QueryBus) { }

	/**
	 * Creates a new course.
	 */
	@ApiOperation({
		operationId: "createCourse",
		summary: "Create course.",
		description: "Creates a new course."
	})
	@Post()
	@UseGuards(AuthGuard())
	@Roles(UserRole.MGMT_ADMIN, UserRole.SYSTEM_ADMIN)
	createCourse(@Body() courseDto: CourseCreateDto): Promise<CourseDto> {
		return this.courseService.createCourse(courseDto);
	}
	
	/**
	 * Returns all courses that match the given filter.
	 */
	@Get()
	@ApiOperation({
		operationId: "getCourses",
		summary: "Get courses.",
		description: "Returns all courses that match the given filter."
	})
	getCourses(@Query() filter?: CourseFilter): Promise<CourseDto[]> {
		return this.courseService.getCourses(filter);
	}

	/**
	 * Returns the course.
	 */
	@Get(":courseId")
	@UseGuards(AuthGuard(), CourseMemberGuard)
	@ApiOperation({
		operationId: "getCourseById",
		summary: "Get course.",
		description: "Retrieves the course, if the requesting user is a member of this course."
	})
	getCourseById(@Param("courseId") courseId: CourseId): Promise<CourseDto> {
		return this.courseService.getCourseById(courseId);
	}

	/**
	 * Returns the course.
	 */
	@Get(":name/semester/:semester")
	@ApiOperation({
		operationId: "getCourseByNameAndSemester",
		summary: "Get course by name and semester.",
		description: ""
	})
	getCourseByNameAndSemester(
		@Param("name") name: string,
		@Param("semester") semester: string
	): Promise<CourseDto> {

		return this.courseService.getCourseByNameAndSemester(name, semester);
	}

	/**
	 * Updates the course.
	 */
	@Patch(":courseId")
	@ApiOperation({
		operationId: "updateCourse",
		summary: "Update course.",
		description: "Updates the course."
	})
	updateCourse(
		@Param("courseId") courseId: CourseId,
		@Body() courseDto: CourseDto
	): Promise<CourseDto> {

		return this.courseService.updateCourse(courseId, courseDto);
	}

	/**
	 * Deletes the course.
	 */
	@Delete(":courseId")
	@ApiOperation({
		operationId: "deleteCourse",
		summary: "Delete course.",
		description: "Deletes the course."
	})
	deleteCourse(
		@Param("courseId") courseId: CourseId,
	): Promise<void> {

		return throwIfRequestFailed(
			this.courseService.deleteCourse(courseId),
			`Failed to delete course (${courseId}).`
		);
	}

}
