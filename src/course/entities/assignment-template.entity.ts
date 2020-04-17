import { BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, Entity } from "typeorm";
import { AssignmentType, CollaborationType } from "../../shared/enums";
import { CourseConfig } from "./course-config.entity";

@Entity()
export class AssignmentTemplate extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(type => CourseConfig, courseConfig => courseConfig.assignmentTemplates, { onDelete: "CASCADE" })
	courseConfig: CourseConfig;

	@Column()
	courseConfigId: number;

	@Column()
	name: string;

	@Column({ nullable: true })
	titleSchema?: string;

	@Column({ type: "enum", enum: AssignmentType, default: AssignmentType.HOMEWORK })
	type: AssignmentType;

	@Column({ type: "enum", enum: CollaborationType, default: CollaborationType.GROUP_OR_SINGLE })
	collaboration: CollaborationType;

	@Column({ nullable: true })
	points?: number;
}
