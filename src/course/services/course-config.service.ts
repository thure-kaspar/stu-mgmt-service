import { Injectable, NotImplementedException } from "@nestjs/common";
import { CourseConfigDto, CourseConfigUpdateDto } from "../dto/course-config.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseConfig } from "../entities/course-config.entity";
import { GroupSettings } from "../entities/group-settings.entity";
import { AdmissionCritera } from "../entities/admission-criteria.entity";
import { AdmissionCriteriaDto } from "../dto/admission-criteria.dto";
import { GroupSettingsDto, GroupSettingsUpdateDto } from "../dto/group-settings.dto";
import { AssignmentTemplate } from "../entities/assignment-template.entity";
import { AssignmentTemplateDto } from "../dto/assignment-template.dto";
import { CourseConfigRepository } from "../database/repositories/course-config.repository";
import { GroupSettingsRepository } from "../database/repositories/group-settings.repository";
import { AssignmentTemplateRepository } from "../database/repositories/assignment-template.repository";
import { AdmissionCriteraRepository } from "../database/repositories/admission-criteria.repository";

@Injectable()
export class CourseConfigService {

	constructor(@InjectRepository(CourseConfig) private configRepo: CourseConfigRepository,
				@InjectRepository(GroupSettings) private groupSettingsRepo: GroupSettingsRepository,
				@InjectRepository(AdmissionCritera) private admissionCriteriaRepo: AdmissionCriteraRepository,
				@InjectRepository(AssignmentTemplate) private templateRepo: AssignmentTemplateRepository) { }

	/** Creates the configuration for a course. */
	async createCourseConfig(courseId: string, configDto: CourseConfigDto): Promise<CourseConfigDto> {
		const config = await this.configRepo.createCourseConfig(courseId, configDto);
		return config.toDto();
	}

	/** Creates the admission criteria for a course. */
	async createAdmissionCriteria(configId: number, criteriaDto: AdmissionCriteriaDto): Promise<AdmissionCriteriaDto> {
		const criteria = await this.admissionCriteriaRepo.createAdmissionCriteria(configId, criteriaDto);
		return criteria.toDto();
	}

	/** Creates a template for an assignment. */
	async createAssignmentTemplate(configId: number, templateDto: AssignmentTemplateDto): Promise<AssignmentTemplateDto> {
		const template = await this.templateRepo.createAssignmentTemplate(configId, templateDto);
		return template.toDto();
	}

	/**
	 * Returns the complete configuration of a course.
	 * @param [excludePriviliged=false] If true, priviliged fields (i.e password) will be exluded.
	 */
	async getCourseConfig(courseId: string, excludePriviliged = false): Promise<CourseConfigDto> {
		const config = await this.configRepo.getByCourseId(courseId);
		return config.toDto();
	}
	
	/** Returns the group settings of a course. */
	async getGroupSettings(courseId: string): Promise<GroupSettingsDto> {
		const settings = await this.groupSettingsRepo.getByCourseId(courseId);
		return settings.toDto();
	}
	
	/** Returns the admission criteria of a course. */
	async getAdmissionCriteria(courseId: string): Promise<AdmissionCriteriaDto> {
		const criteria = await this.admissionCriteriaRepo.getByCourseId(courseId);
		return criteria.toDto();
	}
	
	/** Returns all assignment templates that are available for this course. */
	async getAssignmentTemplates(courseId: string): Promise<AssignmentTemplateDto[]> {
		const templates = await this.templateRepo.getTemplatesByCourseId(courseId);
		return templates.map(t => t.toDto()); 
	}
	
	/** Updates the course configuration. */
	async updateCourseConfig(courseId: string, update: CourseConfigUpdateDto): Promise<CourseConfigDto> {
		const config = await this.configRepo.updateCourseConfig(courseId, update);
		return config.toDto();
	}
	
	/**
	 * Updates the group settings of a course.
	 */
	async updateGroupSettings(courseId: string, update: GroupSettingsUpdateDto): Promise<GroupSettingsDto> {
		const settings = await this.groupSettingsRepo.updateGroupSettings(courseId, update);
		return settings.toDto();
	}
	
	/** Updates the admission criteria of a course. */
	async updateAdmissionCriteria(courseId: string, criteriaDto: AdmissionCriteriaDto): Promise<AdmissionCriteriaDto> {
		const criteria = await this.admissionCriteriaRepo.updateAssignmentCriteria(courseId, criteriaDto);
		return criteria.toDto();
	}

	/** Updates the assignment template */
	async updateAssignmentTemplate(id: number, update: AssignmentTemplateDto): Promise<AssignmentTemplateDto> {
		const template = await this.templateRepo.updateTemplate(id, update);
		return template.toDto();
	}
		
	/**
	 * Removes the complete course configuration.
	 * @throws Error, if deletion failed or had no effect.
	 */
	async removeCourseConfig(courseId: string): Promise<void> {
		const deleted = await this.configRepo.removeCourseConfig(courseId);
		if (!deleted) throw new Error("Delete had no effect.");
	}
	
	/**
	 * Removes the admission criteria for a course.
	 * @throws Error, if deletion failed or had no effect.
	 */
	async removeAdmissionCriteria(courseId: string): Promise<void> {
		const deleted = await this.admissionCriteriaRepo.removeAdmissionCriteria(courseId);
		if (!deleted) throw new Error("Delete had no effect.");
	}

	/**
	 * Removes the assignment template from a course.
	 * @param id Id of the assignment template
	 * @throws Error, if deletion failed or had no effect.
	 */
	async removeAssignmentTemplateFromCourse(courseId: string, id: number): Promise<void> { 
		throw new NotImplementedException(); // TODO: Implement template course relation
	}

}
