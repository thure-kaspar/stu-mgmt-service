import { BaseEntity, PrimaryGeneratedColumn, OneToOne, Column, OneToMany, Entity, JoinColumn } from "typeorm";
import { GroupSettings } from "./group-settings.entity";
import { AdmissionCritera } from "./admission-criteria.entity";
import { AssignmentTemplate } from "./assignment-template.entity";
import { Course } from "../../shared/entities/course.entity";

@Entity()
export class CourseConfig extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(type => Course, course => course.config, { onDelete: "CASCADE" })
	@JoinColumn()
	course: Course;

	@Column()
	courseId: string;

	@Column({ nullable: true })
	password: string;

	@Column({ nullable: true })
	subscriptionUrl: string;

	@OneToOne(type => GroupSettings, groupSettings => groupSettings.courseConfig, { cascade: ["insert"] })
	groupSettings: GroupSettings;

	@OneToOne(type => AdmissionCritera, admissionCriteria => admissionCriteria.courseConfig, { cascade: ["insert"], nullable: true })
	admissionCriteria: AdmissionCritera;

	@OneToMany(type => AssignmentTemplate, assignmentTemplate => assignmentTemplate.courseConfig, { cascade: ["insert"] })
	assignmentTemplates: AssignmentTemplate[];
}
