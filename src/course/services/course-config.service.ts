import { Injectable, BadRequestException } from "@nestjs/common";
import { CourseConfigDto, CourseConfigUpdateDto } from "../dto/course-config/course-config.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseConfig } from "../entities/course-config.entity";
import { GroupSettings } from "../entities/group-settings.entity";
import { AdmissionCriteria } from "../entities/admission-criteria.entity";
import { AdmissionCriteriaDto } from "../dto/course-config/admission-criteria.dto";
import { GroupSettingsDto, GroupSettingsUpdateDto } from "../dto/course-config/group-settings.dto";
import { AssignmentTemplate } from "../entities/assignment-template.entity";
import { AssignmentTemplateDto } from "../dto/course-config/assignment-template.dto";
import { CourseConfigRepository } from "../repositories/course-config.repository";
import { GroupSettingsRepository } from "../repositories/group-settings.repository";
import { AssignmentTemplateRepository } from "../repositories/assignment-template.repository";
import { AdmissionCriteriaRepository } from "../repositories/admission-criteria.repository";
import { CourseId } from "../entities/course.entity";

@Injectable()
export class CourseConfigService {
	constructor(
		@InjectRepository(CourseConfig) private configRepo: CourseConfigRepository,
		@InjectRepository(GroupSettings) private groupSettingsRepo: GroupSettingsRepository,
		@InjectRepository(AdmissionCriteria)
		private admissionCriteriaRepo: AdmissionCriteriaRepository,
		@InjectRepository(AssignmentTemplate) private templateRepo: AssignmentTemplateRepository
	) {}

	/** Creates the configuration for a course. */
	async createCourseConfig(
		courseId: CourseId,
		configDto: CourseConfigDto
	): Promise<CourseConfigDto> {
		const config = await this.configRepo.createCourseConfig(courseId, configDto);
		return config.toDto();
	}

	/** Creates the admission criteria for a course. */
	async createAdmissionCriteria(
		configId: number,
		criteriaDto: AdmissionCriteriaDto
	): Promise<AdmissionCriteriaDto> {
		const criteria = await this.admissionCriteriaRepo.createAdmissionCriteria(
			configId,
			criteriaDto
		);
		return criteria.toDto();
	}

	/** Creates a template for an assignment. */
	async createAssignmentTemplate(
		configId: number,
		templateDto: AssignmentTemplateDto
	): Promise<AssignmentTemplateDto> {
		const template = await this.templateRepo.createAssignmentTemplate(configId, templateDto);
		return template.toDto();
	}

	/**
	 * Returns the complete configuration of a course.
	 * @param [excludePriviliged=false] If true, priviliged fields (i.e password) will be exluded.
	 */
	async getCourseConfig(courseId: CourseId, excludePriviliged = false): Promise<CourseConfigDto> {
		const config = await this.configRepo.getByCourseId(courseId);
		return config.toDto();
	}

	/** Returns the group settings of a course. */
	async getGroupSettings(courseId: CourseId): Promise<GroupSettingsDto> {
		const settings = await this.groupSettingsRepo.getByCourseId(courseId);
		return settings.toDto();
	}

	/** Returns the admission criteria of a course. */
	async getAdmissionCriteria(courseId: CourseId): Promise<AdmissionCriteriaDto> {
		const criteria = await this.admissionCriteriaRepo.getByCourseId(courseId);
		return criteria.toDto();
	}

	/** Returns all assignment templates that are available for this course. */
	async getAssignmentTemplates(courseId: CourseId): Promise<AssignmentTemplateDto[]> {
		const templates = await this.templateRepo.getTemplatesByCourseId(courseId);
		return templates.map(t => t.toDto());
	}

	/** Updates the course configuration. */
	async updateCourseConfig(
		courseId: CourseId,
		update: CourseConfigUpdateDto
	): Promise<CourseConfigDto> {
		const config = await this.configRepo.updateCourseConfig(courseId, update);
		return config.toDto();
	}

	/**
	 * Updates the group settings of a course.
	 */
	async updateGroupSettings(
		courseId: CourseId,
		update: GroupSettingsUpdateDto
	): Promise<GroupSettingsDto> {
		const settings = await this.groupSettingsRepo.updateGroupSettings(courseId, update);
		return settings.toDto();
	}

	/** Updates the admission criteria of a course. */
	async updateAdmissionCriteria(
		courseId: CourseId,
		criteriaDto: AdmissionCriteriaDto
	): Promise<AdmissionCriteriaDto> {
		const criteria = await this.admissionCriteriaRepo.updateAdmissionCriteria(
			courseId,
			criteriaDto
		); // TODO: validate Dto
		return criteria.toDto();
	}

	/** Updates the assignment template */
	async updateAssignmentTemplate(
		id: number,
		update: AssignmentTemplateDto
	): Promise<AssignmentTemplateDto> {
		const template = await this.templateRepo.updateTemplate(id, update);
		return template.toDto();
	}

	/**
	 * Removes the complete course configuration.
	 * @throws Error, if deletion failed or had no effect.
	 */
	async removeCourseConfig(courseId: CourseId): Promise<void> {
		const deleted = await this.configRepo.removeCourseConfig(courseId);
		if (!deleted) throw new Error("Delete had no effect.");
	}

	/**
	 * Removes the admission criteria for a course.
	 * @throws Error, if deletion failed or had no effect.
	 */
	async removeAdmissionCriteria(courseId: CourseId): Promise<void> {
		const deleted = await this.admissionCriteriaRepo.removeAdmissionCriteria(courseId);
		if (!deleted) throw new Error("Delete had no effect.");
	}

	/**
	 * Removes the assignment template from a course.
	 * @param id Id of the assignment template
	 * @throws Error, if deletion failed or had no effect.
	 */
	async removeAssignmentTemplateFromCourse(courseId: CourseId, id: number): Promise<void> {
		const deleted = await this.templateRepo.removeTemplate(id);
		if (!deleted) throw new BadRequestException("Failed to delete the template.");
	}
}
