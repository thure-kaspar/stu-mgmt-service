import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, AfterInsert } from "typeorm";
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

	@AfterInsert()
	async assignIdToDto(): Promise<void> {
		this.admissionCriteria.id = this.id;
		await this.save();
	}

}
