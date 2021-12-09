import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ToDto } from "../../shared/interfaces/to-dto.interface";
import { CourseConfig } from "./course-config.entity";

@Entity()
export class AdmissionFromPreviousSemester implements ToDto<number[]> {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => CourseConfig, courseConfig => courseConfig.admissionFromPreviousSemester, {
		onDelete: "CASCADE"
	})
	@JoinColumn()
	courseConfig: CourseConfig;

	@Column()
	courseConfigId: number;

	@Column({ type: "json", nullable: true })
	admissionFromPreviousSemester: number[];

	toDto(): number[] {
		return this.admissionFromPreviousSemester ?? [];
	}
}
