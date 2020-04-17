import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { CourseConfig } from "./course-config.entity";
import { AdmissionCriteriaDto } from "../dto/admission-criteria.dto";

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
