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
import { EventBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { ActivityEvent } from "../../activity/activity.event";
import { Roles } from "../../auth/decorators/roles.decorator";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { RoleGuard } from "../../auth/guards/role.guard";
import { CourseRole, UserRole } from "../../shared/enums";
import { PaginatedResult, throwIfRequestFailed } from "../../utils/http-utils";
import { GetCourse, GetParticipant } from "../decorators/decorators";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { CourseAboutDto } from "../dto/course/course-about.dto";
import { CourseCreateDto } from "../dto/course/course-create.dto";
import { CourseFilter } from "../dto/course/course-filter.dto";
import { CourseDto } from "../dto/course/course.dto";
import { CourseId } from "../entities/course.entity";
import { CourseByNameAndSemesterGuard } from "../guards/course-by-name-semester.guard";
import { CourseMemberGuard } from "../guards/course-member/course-member.guard";
import { TeachingStaffGuard } from "../guards/teaching-staff.guard";
import { Course } from "../models/course.model";
import { Participant } from "../models/participant.model";
import { CourseParticipantsService } from "../services/course-participants.service";
import { CourseService } from "../services/course.service";
import { Public } from "nest-keycloak-connect";
import { environment } from "src/.config/environment";

@ApiBearerAuth()
@ApiTags("course")
@Controller("courses")
@Public(environment.is("development", "demo", "testing"))
export class CourseController {
	constructor(
		private courseService: CourseService,
		private participantsService: CourseParticipantsService,
		private events: EventBus
	) {}

	/**
	 * Creates a new course.
	 */
	@ApiOperation({
		operationId: "createCourse",
		summary: "Create course.",
		description: "Creates a new course."
	})
	@Post()
	@UseGuards(AuthGuard, RoleGuard)
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
	// TODO: Is this supposed to always be accessible (@Public(true))
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
	@UseGuards(AuthGuard, CourseMemberGuard)
	getCourseById(
		@Param("courseId") courseId: CourseId,
		@GetParticipant() participant: Participant
	): Promise<CourseDto> {
		const course = this.courseService.getCourseById(courseId);

		if (participant.isStudent()) {
			this.events.publish(new ActivityEvent(participant.userId, courseId));
		}

		return course;
	}

	@ApiOperation({
		operationId: "getCourseAbout",
		summary: "Get information about the course.",
		description: "Retrieves the course and information that is required by its /about page."
	})
	@Get(":courseId/about")
	@UseGuards(AuthGuard, CourseMemberGuard)
	async getCourseAbout(@Param("courseId") courseId: CourseId): Promise<CourseAboutDto> {
		const [[participants, count], course] = await Promise.all([
			this.participantsService.getParticipants(courseId),
			this.courseService.getCourseById(courseId)
		]);

		const teachingStaff: Partial<ParticipantDto>[] = participants
			.filter(p => p.role !== CourseRole.STUDENT)
			.map(p => ({
				displayName: p.displayName,
				role: p.role
			}));

		return {
			course,
			teachingStaff: teachingStaff as ParticipantDto[],
			participantsCount: count
		};
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
	@UseGuards(AuthGuard, CourseByNameAndSemesterGuard, CourseMemberGuard)
	getCourseByNameAndSemester(
		@Param("name") name: string,
		@Param("semester") semester: string,
		@GetCourse() course: Course
	): Promise<CourseDto> {
		return this.courseService.getCourseById(course.id);
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
	@UseGuards(AuthGuard, CourseMemberGuard, TeachingStaffGuard)
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
	@UseGuards(AuthGuard, RoleGuard)
	@Roles(UserRole.SYSTEM_ADMIN, UserRole.MGMT_ADMIN)
	deleteCourse(@Param("courseId") courseId: CourseId): Promise<void> {
		return throwIfRequestFailed(
			this.courseService.deleteCourse(courseId),
			`Failed to delete course (${courseId}).`
		);
	}
}
