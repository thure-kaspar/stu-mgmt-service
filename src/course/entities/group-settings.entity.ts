import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { CourseConfig } from "./course-config.entity";

@Entity()
export class GroupSettings extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(type => CourseConfig, courseConfig => courseConfig.groupSettings, { onDelete: "CASCADE" })
	@JoinColumn()
	courseConfig: CourseConfig;

	@Column()
	courseConfigId: number;

	@Column()
	allowGroups: boolean;

	@Column({ nullable: true })
	nameSchema: string;

	@Column()
	sizeMin: number;

	@Column()
	sizeMax: number;

	@Column()
	selfmanaged: boolean;
}
