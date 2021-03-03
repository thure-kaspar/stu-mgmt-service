import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { CourseConfigDto } from "../dto/course-config/course-config.dto";
import { AdmissionCriteria } from "./admission-criteria.entity";
import { AssignmentTemplate } from "./assignment-template.entity";
import { Course, CourseId } from "./course.entity";
import { GroupSettings } from "./group-settings.entity";

@Entity()
export class CourseConfig {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(type => Course, course => course.config, { onDelete: "CASCADE" })
	@JoinColumn()
	course: Course;

	@Column()
	courseId: CourseId;

	@Column({ nullable: true })
	password: string;

	@Column({ nullable: true })
	subscriptionUrl: string;

	@OneToOne(type => GroupSettings, groupSettings => groupSettings.courseConfig, {
		cascade: ["insert"]
	})
	groupSettings: GroupSettings;

	@OneToOne(type => AdmissionCriteria, admissionCriteria => admissionCriteria.courseConfig, {
		cascade: ["insert"],
		nullable: true
	})
	admissionCriteria: AdmissionCriteria;

	@OneToMany(type => AssignmentTemplate, assignmentTemplate => assignmentTemplate.courseConfig, {
		cascade: ["insert"]
	})
	assignmentTemplates: AssignmentTemplate[];

	/**
	 * Returns the Dto-representation of this entity.
	 * @param [excludePriviliged=false] If true, excludes password and subscription url.
	 */
	toDto(excludePriviliged = false): CourseConfigDto {
		const configDto: CourseConfigDto = {
			id: this.id,
			password: excludePriviliged ? undefined : this.password,
			subscriptionUrl: excludePriviliged ? undefined : this.subscriptionUrl
		};

		if (this.admissionCriteria) configDto.admissionCriteria = this.admissionCriteria.toDto();

		if (this.groupSettings) configDto.groupSettings = this.groupSettings.toDto();

		if (this.assignmentTemplates)
			configDto.assignmentTemplates = this.assignmentTemplates.map(t => t.toDto());

		return configDto;
	}
}
