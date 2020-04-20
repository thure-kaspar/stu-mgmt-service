import { EntityRepository, Repository } from "typeorm";
import { CourseConfig } from "../../entities/course-config.entity";
import { CourseConfigDto } from "../../dto/course-config.dto";
import { CourseConfigUpdateDto } from "../../dto/course-config.dto";
import { GroupSettings } from "../../entities/group-settings.entity";
import { AssignmentTemplate } from "../../entities/assignment-template.entity";
import { AdmissionCritera } from "../../entities/admission-criteria.entity";

@EntityRepository(CourseConfig)
export class CourseConfigRepository extends Repository<CourseConfig> {

	/** Inserts the course config into the database. */
	createCourseConfig(courseId: string, configDto: CourseConfigDto): Promise<CourseConfig> {
		const config = this._createInsertableEntity(courseId, configDto);
		return config.save();
	}

	/** Returns the course config without relations. Throws error, if not found. */
	getById(id: number): Promise<CourseConfig> {
		return this.findOneOrFail(id);
	}

	/** Returns the complete course config. Throws Error, if not found. */
	getByCourseId(courseId: string): Promise<CourseConfig> {
		return this.findOneOrFail({
			where: { courseId },
			relations: ["groupSettings", "admissionCriteria", "assignmentTemplates"]
		});
	}

	/** Partially updates the course config. Does not update related entites. */
	async updateCourseConfig(courseId: string, partial: Partial<CourseConfigUpdateDto>): Promise<CourseConfig> {
		await this.update({ courseId }, partial);
		return this.getByCourseId(courseId);
	}

	/** Removes the course config from the database. Returns true, if removal was successful. */
	async removeCourseConfig(courseId: string): Promise<boolean> {
		return (await this.delete({ courseId })).affected == 1 ? true : false;
	}

	/** Creates an entity from the Dto that can be used for insertion into the database. */
	public _createInsertableEntity(courseId: string, configDto: CourseConfigDto): CourseConfig {
		// Course config
		const config = new CourseConfig();
		config.courseId = courseId;
		config.password = configDto.password;
		config.subscriptionUrl = configDto.subscriptionUrl;
	
		// Group settings
		if (configDto.groupSettings) {
			config.groupSettings = new GroupSettings();
			Object.assign(config.groupSettings, configDto.groupSettings);
		}

		// Admission criteria
		if (configDto.admissionCriteria?.criteria?.length > 0) {
			config.admissionCriteria = new AdmissionCritera();
			config.admissionCriteria.admissionCriteria = configDto.admissionCriteria;
		}
		
		// Assignment templates
		if (configDto.assignmentTemplates?.length > 0) {
			config.assignmentTemplates = configDto.assignmentTemplates.map((t, index) => {
				const template = new AssignmentTemplate();
				Object.assign(template, configDto.assignmentTemplates[index]);
				return template;
			});
		}

		return config;
	}
	
}
