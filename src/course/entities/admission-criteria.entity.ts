import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { CourseConfig } from "./course-config.entity";
import { AdmissionCriteriaDto } from "../dto/admission-criteria.dto";

@Entity()
export class AdmissionCritera extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(type => CourseConfig, courseConfig => courseConfig.admissionCriteria, { onDelete: "CASCADE" })
	@JoinColumn()
	courseConfig: CourseConfig;

	@Column()
	courseConfigId: number;

	@Column("json")
	admissionCriteria: AdmissionCriteriaDto;

	toDto(): AdmissionCriteriaDto {
		return this.admissionCriteria;
	}

}
