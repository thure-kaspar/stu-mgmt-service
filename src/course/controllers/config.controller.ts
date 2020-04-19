import { Controller, Param, Body, Post, Get, Patch, Delete } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CourseConfigDto } from "../dto/course-config.dto";
import { GroupSettingsDto } from "../dto/group-settings.dto";
import { AdmissionCriteriaDto } from "../dto/admission-criteria.dto";
import { AssignmentTemplateDto } from "../dto/assignment-template.dto";
import { CourseConfigService } from "../services/course-config.service";
import { CourseConfigUpdateDto } from "../dto/course-config-update.dto";
import { GroupSettingsUpdateDto } from "../dto/group-settings-update.dto";

@ApiTags("course-config")
@Controller("courses/:courseId/config")
export class CourseConfigController {

	constructor(private configService: CourseConfigService) { }

	@Post()
	@ApiOperation({
		operationId: "createCourseConfig",
		summary: "Create course config",
		description: "Saves a configuration for a course, if it does not have one already."
	})
	createCourseConfig(
		@Param("courseId") courseId: string,
		@Body() config: CourseConfigDto
	): Promise<CourseConfigDto> {
		return this.configService.createCourseConfig(courseId, config);
	}

	@Post("admission-criteria")
	@ApiOperation({
		operationId: "createAdmissionCriteria",
		summary: "Create admission criteria",
		description: "Creates admission criteria for a course."
	})
	createAdmissionCriteria(
		@Param("courseId") courseId: string, 
		@Param("configId") configId: number,
		@Body() admissionCriteria: AdmissionCriteriaDto
	): Promise<AdmissionCriteriaDto> {
		return this.configService.createAdmissionCriteria(configId, admissionCriteria);
	}

	@Post("assignment-templates")
	@ApiOperation({
		operationId: "createAssignmentTemplate",
		summary: "Create assignment template",
		description: "Creates an assignment template."
	})
	createAssignmentTemplate(
		@Param("courseId") courseId: string,
		@Param("configId") configId: number,
		@Body() template: AssignmentTemplateDto
	): Promise<AssignmentTemplateDto> {
		return this.configService.createAssignmentTemplate(configId, template);
	}

	@Get()
	@ApiOperation({
		operationId: "getCourseConfig",
		summary: "Get course config",
		description: "Retrieves the configuration of a course."
	})
	getCourseConfig(@Param("courseId") courseId: string): Promise<CourseConfigDto> {
		return this.configService.getCourseConfig(courseId);
	}

	@Get("group-settings")
	@ApiOperation({
		operationId: "getGroupSettings",
		summary: "Get group settings",
		description: "Retrieves the group settings of a course."
	})
	getGroupSettings(@Param("courseId") courseId: string): Promise<GroupSettingsDto> {
		return this.configService.getGroupSettings(courseId);
	}

	@Get("admission-criteria")
	@ApiOperation({
		operationId: "getAdmissionCriteria",
		summary: "Get admission criteria",
		description: "Retrieves the admission criteria of a course."
	})
	getAdmissionCriteria(@Param("courseId") courseId: string): Promise<AdmissionCriteriaDto> {
		return this.configService.getAdmissionCriteria(courseId);
	}

	@Get("assignment-templates")
	@ApiOperation({
		operationId: "getAssignmentTemplates",
		summary: "Get assignment templates",
		description: "Retrieves the assignment templates of a course."
	})
	getAssignmentTemplates(@Param("courseId") courseId: string): Promise<AssignmentTemplateDto[]> {
		return this.configService.getAssignmentTemplates(courseId);
	}

	@Patch()
	@ApiOperation({
		operationId: "updateCourseConfig",
		summary: "Update course config",
		description: "Updates the configuration of a course."
	})
	updateCourseConfig(
		@Param("courseId") courseId: string,
		@Body() update: CourseConfigUpdateDto,
	): Promise<CourseConfigDto> {
		return this.configService.updateCourseConfig(courseId, update);
	}

	@Patch("group-settings")
	@ApiOperation({
		operationId: "updateGroupSettings",
		summary: "Update group settings",
		description: "Updates the group settings of a course."
	})
	updateGroupSettings(
		@Param("courseId") courseId: string,
		@Body() update: GroupSettingsUpdateDto
	): Promise<GroupSettingsDto> {
		return this.configService.updateGroupSettings(courseId, update);
	}

	@Patch("admission-criteria")
	@ApiOperation({
		operationId: "updateAdmissionCriteria",
		summary: "Update admission criteria",
		description: "Updates the admission criteria of a course."
	})
	updateAdmissionCriteria(
		@Param("courseId") courseId: string,
		@Body() criteria: AdmissionCriteriaDto
	): Promise<AdmissionCriteriaDto> {
		return this.configService.updateAdmissionCriteria(courseId, criteria);
	}

	@Delete()
	@ApiOperation({
		operationId: "removeCourseConfig",
		summary: "Remove course config",
		description: "Removes the complete configuration of a course. Includes group settings, admission criteria and templates."
	})
	deleteCourseConfig(@Param("courseId") courseId: string): Promise<boolean> {
		return this.configService.removeCourseConfig(courseId);
	}

	@Delete("admission-criteria")
	@ApiOperation({
		operationId: "removeAdmissionCriteria",
		summary: "Remove admssion criteria",
		description: "Removes the admission criteria of a course."
	})
	deleteAdmissionCriteria(@Param("courseId") courseId: string): Promise<boolean> {
		return this.configService.removeAdmissionCriteria(courseId);
	}

	@Delete("assignment-template")
	@ApiOperation({
		operationId: "deleteAssignmentTemplate",
		summary: "Delete assignment template",
		description: "Deletes the assignment template."
	})
	deleteAssignmentTemplate(
		@Param("courseId") courseId: string,
		@Param("id") id: number
	): Promise<boolean> {
		return this.configService.removeAssignmentTemplateFromCourse(courseId, id);
	} 
}
