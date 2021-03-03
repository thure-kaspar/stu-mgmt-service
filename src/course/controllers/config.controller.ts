import { Controller, Param, Body, Post, Get, Patch, Delete, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CourseConfigDto } from "../dto/course-config/course-config.dto";
import { GroupSettingsDto } from "../dto/course-config/group-settings.dto";
import { AdmissionCriteriaDto } from "../dto/course-config/admission-criteria.dto";
import { AssignmentTemplateDto } from "../dto/course-config/assignment-template.dto";
import { CourseConfigService } from "../services/course-config.service";
import { CourseConfigUpdateDto } from "../dto/course-config/course-config.dto";
import { GroupSettingsUpdateDto } from "../dto/course-config/group-settings.dto";
import { CourseId } from "../entities/course.entity";
import { AuthGuard } from "@nestjs/passport";
import { CourseMemberGuard } from "../guards/course-member.guard";
import { TeachingStaffGuard } from "../guards/teaching-staff.guard";

@ApiBearerAuth()
@ApiTags("course-config")
@Controller("courses/:courseId/config")
@UseGuards(AuthGuard(), CourseMemberGuard)
export class CourseConfigController {
	constructor(private configService: CourseConfigService) {}

	//#region POST
	@ApiOperation({
		operationId: "createCourseConfig",
		summary: "Create course config.",
		description: "Saves a configuration for a course, if it does not have one already."
	})
	@Post()
	@UseGuards(TeachingStaffGuard)
	createCourseConfig(
		@Param("courseId") courseId: CourseId,
		@Body() config: CourseConfigDto
	): Promise<CourseConfigDto> {
		return this.configService.createCourseConfig(courseId, config);
	}

	@ApiOperation({
		operationId: "createAdmissionCriteria",
		summary: "Create admission criteria.",
		description: "Creates admission criteria for a course."
	})
	@Post(":configId/admission-criteria")
	@UseGuards(TeachingStaffGuard)
	createAdmissionCriteria(
		@Param("courseId") courseId: CourseId,
		@Param("configId") configId: number,
		@Body() admissionCriteria: AdmissionCriteriaDto
	): Promise<AdmissionCriteriaDto> {
		return this.configService.createAdmissionCriteria(configId, admissionCriteria);
	}

	@ApiOperation({
		operationId: "createAssignmentTemplate",
		summary: "Create assignment template.",
		description: "Creates an assignment template."
	})
	@Post(":configId/assignment-templates")
	@UseGuards(TeachingStaffGuard)
	createAssignmentTemplate(
		@Param("courseId") courseId: CourseId,
		@Param("configId") configId: number,
		@Body() template: AssignmentTemplateDto
	): Promise<AssignmentTemplateDto> {
		return this.configService.createAssignmentTemplate(configId, template);
	}
	//#endregion

	//#region GET
	@Get()
	@ApiOperation({
		operationId: "getCourseConfig",
		summary: "Get course config.",
		description: "Retrieves the configuration of a course."
	})
	getCourseConfig(@Param("courseId") courseId: CourseId): Promise<CourseConfigDto> {
		return this.configService.getCourseConfig(courseId);
	}

	@ApiOperation({
		operationId: "getGroupSettings",
		summary: "Get group settings.",
		description: "Retrieves the group settings of a course."
	})
	@Get("group-settings")
	getGroupSettings(@Param("courseId") courseId: CourseId): Promise<GroupSettingsDto> {
		return this.configService.getGroupSettings(courseId);
	}

	@ApiOperation({
		operationId: "getAdmissionCriteria",
		summary: "Get admission criteria.",
		description: "Retrieves the admission criteria of a course."
	})
	@Get("admission-criteria")
	getAdmissionCriteria(@Param("courseId") courseId: CourseId): Promise<AdmissionCriteriaDto> {
		return this.configService.getAdmissionCriteria(courseId);
	}

	@ApiOperation({
		operationId: "getAssignmentTemplates",
		summary: "Get assignment templates.",
		description: "Retrieves the assignment templates of a course."
	})
	@Get("assignment-templates")
	@UseGuards(TeachingStaffGuard)
	getAssignmentTemplates(
		@Param("courseId") courseId: CourseId
	): Promise<AssignmentTemplateDto[]> {
		return this.configService.getAssignmentTemplates(courseId);
	}
	//#endregion

	//#region PATCH
	@ApiOperation({
		operationId: "updateCourseConfig",
		summary: "Update course config.",
		description: "Updates the configuration of a course."
	})
	@Patch()
	@UseGuards(TeachingStaffGuard)
	updateCourseConfig(
		@Param("courseId") courseId: CourseId,
		@Body() update: CourseConfigUpdateDto
	): Promise<CourseConfigDto> {
		return this.configService.updateCourseConfig(courseId, update);
	}

	@ApiOperation({
		operationId: "updateGroupSettings",
		summary: "Update group settings.",
		description: "Updates the group settings of a course."
	})
	@Patch("group-settings")
	@UseGuards(TeachingStaffGuard)
	updateGroupSettings(
		@Param("courseId") courseId: CourseId,
		@Body() update: GroupSettingsUpdateDto
	): Promise<GroupSettingsDto> {
		return this.configService.updateGroupSettings(courseId, update);
	}

	@ApiOperation({
		operationId: "updateAdmissionCriteria",
		summary: "Update admission criteria.",
		description: "Updates the admission criteria of a course."
	})
	@Patch("admission-criteria")
	@UseGuards(TeachingStaffGuard)
	updateAdmissionCriteria(
		@Param("courseId") courseId: CourseId,
		@Body() criteria: AdmissionCriteriaDto
	): Promise<AdmissionCriteriaDto> {
		return this.configService.updateAdmissionCriteria(courseId, criteria);
	}

	@ApiOperation({
		operationId: "updateAssignmentTemplate",
		summary: "Update assignment template.",
		description: "Updates the assignment template."
	})
	@Patch("assignment-template/:id")
	@UseGuards(TeachingStaffGuard)
	updateAssignmentTemplate(
		@Param("courseId") courseId: CourseId,
		@Param("id") id: number,
		@Body() template: AssignmentTemplateDto
	): Promise<AssignmentTemplateDto> {
		return this.configService.updateAssignmentTemplate(id, template);
	}

	//#endregion

	//#region DELETE
	@ApiOperation({
		operationId: "removeCourseConfig",
		summary: "Remove course config.",
		description:
			"Removes the complete configuration of a course. Includes group settings, admission criteria and templates."
	})
	@Delete()
	@UseGuards(TeachingStaffGuard)
	deleteCourseConfig(@Param("courseId") courseId: CourseId): Promise<void> {
		return this.configService.removeCourseConfig(courseId);
	}

	@ApiOperation({
		operationId: "removeAdmissionCriteria",
		summary: "Remove admssion criteria.",
		description: "Removes the admission criteria of a course."
	})
	@Delete("admission-criteria")
	@UseGuards(TeachingStaffGuard)
	deleteAdmissionCriteria(@Param("courseId") courseId: CourseId): Promise<void> {
		return this.configService.removeAdmissionCriteria(courseId);
	}

	@ApiOperation({
		operationId: "deleteAssignmentTemplate",
		summary: "Delete assignment template.",
		description: "Deletes the assignment template."
	})
	@Delete("assignment-template/:id")
	@UseGuards(TeachingStaffGuard)
	deleteAssignmentTemplate(
		@Param("courseId") courseId: CourseId,
		@Param("id") id: number
	): Promise<void> {
		return this.configService.removeAssignmentTemplateFromCourse(courseId, id);
	}
	//#endregion
}
