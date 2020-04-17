import { BaseEntity, PrimaryGeneratedColumn, OneToOne, Column, OneToMany, Entity } from "typeorm";
import { GroupSettings } from "./group-settings.entity";
import { AdmissionCritera } from "./admission-criteria.entity";
import { AssignmentTemplate } from "./assignment-template.entity";
import { Course } from "../../shared/entities/course.entity";

@Entity()
export class CourseConfig extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(type => Course, course => course.config, { onDelete: "CASCADE" })
	course: Course;

	@Column()
	courseId: string;

	@Column({ nullable: true })
	password: string;

	@Column({ nullable: true })
	subscriptionUrl: string;

	@OneToOne(type => GroupSettings, groupSettings => groupSettings.courseConfig, { cascade: true })
	groupSettings: GroupSettings;

	@Column()
	groupSettingsId: number;

	@OneToOne(type => AdmissionCritera, admissionCriteria => admissionCriteria.courseConfig, { cascade: true })
	admissionCriteria: AdmissionCritera;

	@Column()
	admissionCriteriaId: number;

	@OneToMany(type => AssignmentTemplate, assignmentTemplate => assignmentTemplate.courseConfig)
	assignmentTemplates: AssignmentTemplate[];
}
