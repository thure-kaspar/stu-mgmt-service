import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards
} from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { UserRole } from "../../shared/enums";
import { PaginatedResult, throwIfRequestFailed } from "../../utils/http-utils";
import { CourseCreateDto } from "../dto/course/course-create.dto";
import { CourseFilter } from "../dto/course/course-filter.dto";
import { CourseDto } from "../dto/course/course.dto";
import { CourseId } from "../entities/course.entity";
import { CourseMemberGuard } from "../guards/course-member.guard";
import { TeachingStaffGuard } from "../guards/teaching-staff.guard";
import { CourseService } from "../services/course.service";
import { RoleGuard } from "../../auth/guards/role.guard";

@ApiBearerAuth()
@ApiTags("courses")
@Controller("courses")
export class CourseController {
	constructor(private courseService: CourseService, private queryBus: QueryBus) {}

	/**
	 * Creates a new course.
	 */
	@ApiOperation({
		operationId: "createCourse",
		summary: "Create course.",
		description: "Creates a new course."
	})
	@Post()
	@UseGuards(AuthGuard(), RoleGuard)
	@Roles(UserRole.MGMT_ADMIN, UserRole.SYSTEM_ADMIN)
	createCourse(@Body() courseDto: CourseCreateDto): Promise<CourseDto> {
		return this.courseService.createCourse(courseDto);
	}

	/**
	 * Returns all courses that match the given filter.
	 */
	@ApiOperation({
		operationId: "getCourses",
		summary: "Get courses.",
		description: "Returns all courses that match the given filter."
	})
	@Get()
	getCourses(@Req() request: Request, @Query() filter?: CourseFilter): Promise<CourseDto[]> {
		return PaginatedResult(this.courseService.getCourses(filter), request);
	}

	/**
	 * Returns the course.
	 */
	@ApiOperation({
		operationId: "getCourseById",
		summary: "Get course.",
		description: "Retrieves the course, if the requesting user is a member of this course."
	})
	@Get(":courseId")
	@UseGuards(AuthGuard(), CourseMemberGuard)
	getCourseById(@Param("courseId") courseId: CourseId): Promise<CourseDto> {
		return this.courseService.getCourseById(courseId);
	}

	/**
	 * Returns the course.
	 */
	@ApiOperation({
		operationId: "getCourseByNameAndSemester",
		summary: "Get course by name and semester.",
		description: ""
	})
	@Get(":name/semester/:semester")
	@UseGuards(AuthGuard(), CourseMemberGuard)
	getCourseByNameAndSemester(
		@Param("name") name: string,
		@Param("semester") semester: string
	): Promise<CourseDto> {
		return this.courseService.getCourseByNameAndSemester(name, semester);
	}

	/**
	 * Updates the course.
	 */
	@ApiOperation({
		operationId: "updateCourse",
		summary: "Update course.",
		description: "Updates the course."
	})
	@Patch(":courseId")
	@UseGuards(AuthGuard(), CourseMemberGuard, TeachingStaffGuard)
	updateCourse(
		@Param("courseId") courseId: CourseId,
		@Body() courseDto: CourseDto
	): Promise<CourseDto> {
		return this.courseService.updateCourse(courseId, courseDto);
	}

	/**
	 * Deletes the course.
	 */
	@ApiOperation({
		operationId: "deleteCourse",
		summary: "Delete course.",
		description: "Deletes the course."
	})
	@Delete(":courseId")
	@UseGuards(AuthGuard(), CourseMemberGuard, TeachingStaffGuard)
	deleteCourse(@Param("courseId") courseId: CourseId): Promise<void> {
		return throwIfRequestFailed(
			this.courseService.deleteCourse(courseId),
			`Failed to delete course (${courseId}).`
		);
	}
}
