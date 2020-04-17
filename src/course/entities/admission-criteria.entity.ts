import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { AdmissionCriteriaDto } from "../dto/admission-criteria";
import { CourseConfig } from "./course-config.entity";

@Entity()
export class AdmissionCritera extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(type => CourseConfig, courseConfig => courseConfig.admissionCriteria, { onDelete: "CASCADE" })
	courseConfig: CourseConfig;

	@Column()
	courseConfigId: number;

	@Column("json")
	admissionCriteria: AdmissionCriteriaDto;
}
