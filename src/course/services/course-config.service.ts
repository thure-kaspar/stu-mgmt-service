import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdmissionCriteriaDto } from "../dto/course-config/admission-criteria.dto";
import { CourseConfigDto, CourseConfigUpdateDto } from "../dto/course-config/course-config.dto";
import { GroupSettingsDto, GroupSettingsUpdateDto } from "../dto/course-config/group-settings.dto";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { CourseId } from "../entities/course.entity";
import { AdmissionCriteriaRepository } from "../repositories/admission-criteria.repository";
import { AdmissionFromPreviousSemesterRepository } from "../repositories/admission-from-previous-semester.repository";
import { CourseConfigRepository } from "../repositories/course-config.repository";
import { GroupSettingsRepository } from "../repositories/group-settings.repository";
import { ParticipantRepository } from "../repositories/participant.repository";

@Injectable()
export class CourseConfigService {
	constructor(
		@InjectRepository(CourseConfigRepository) private configRepo: CourseConfigRepository,
		@InjectRepository(GroupSettingsRepository)
		private groupSettingsRepo: GroupSettingsRepository,
		@InjectRepository(AdmissionCriteriaRepository)
		private admissionCriteriaRepo: AdmissionCriteriaRepository,
		@InjectRepository(AdmissionFromPreviousSemesterRepository)
		private admissionFromPreviousRepo: AdmissionFromPreviousSemesterRepository,
		@InjectRepository(ParticipantRepository) private participantRepo: ParticipantRepository
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

	async setAdmissionFromPreviousSemester(
		courseId: string,
		matrNrs: number[]
	): Promise<{ matrNrs: number[]; participants: ParticipantDto[] }> {
		const [config, existing] = await Promise.all([
			this.configRepo.getByCourseId(courseId),
			this.admissionFromPreviousRepo.tryGetByCourseId(courseId)
		]);

		const entity = this.admissionFromPreviousRepo.create({
			id: existing?.id ?? undefined,
			courseConfigId: config.id,
			admissionFromPreviousSemester: matrNrs
		});

		await this.admissionFromPreviousRepo.save(entity);
		return this.getAdmissionFromPreviousSemester(courseId);
	}

	/**
	 * Returns the complete configuration of a course.
	 * @param [excludePrivileged=false] If true, privileged fields (i.e password) will be excluded.
	 */
	async getCourseConfig(courseId: CourseId, excludePrivileged = false): Promise<CourseConfigDto> {
		const config = await this.configRepo.getByCourseId(courseId);
		return config.toDto(excludePrivileged);
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

	async getAdmissionFromPreviousSemester(
		courseId: CourseId
	): Promise<{ matrNrs: number[]; participants: ParticipantDto[] }> {
		const admission = await this.admissionFromPreviousRepo.tryGetByCourseId(courseId);

		const result = {
			matrNrs: admission?.toDto() || [],
			participants: []
		};

		if (result.matrNrs.length > 0) {
			result.participants = (
				await this.participantRepo.getParticipantsByMatrNr(courseId, result.matrNrs)
			).map(p => p.toDto());
		}

		return result;
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
}
