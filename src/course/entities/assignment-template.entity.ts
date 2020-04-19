import { BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, Entity, JoinColumn } from "typeorm";
import { AssignmentType, CollaborationType } from "../../shared/enums";
import { CourseConfig } from "./course-config.entity";
import { AssignmentTemplateDto } from "../dto/assignment-template.dto";

@Entity()
export class AssignmentTemplate extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(type => CourseConfig, courseConfig => courseConfig.assignmentTemplates, { onDelete: "CASCADE" })
	@JoinColumn()
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

	toDto(): AssignmentTemplateDto {
		return {
			id: this.id,
			name: this.name,
			collaboration: this.collaboration,
			type: this.type,
			titleSchema: this.titleSchema,
			points: this.points
		};
	}
}
