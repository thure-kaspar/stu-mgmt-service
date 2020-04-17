import { BaseEntity, Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { CourseConfig } from "./course-config.entity";

@Entity()
export class GroupSettings extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(type => CourseConfig, courseConfig => courseConfig.groupSettings, { onDelete: "CASCADE" })
	courseConfig: CourseConfig;

	@Column()
	courseConfigId: number;

	@Column()
	allowGroups: boolean;

	@Column()
	nameSchema: string;

	@Column()
	sizeMin: number;

	@Column()
	sizeMax: number;

	@Column()
	selfmanaged: boolean;
}
