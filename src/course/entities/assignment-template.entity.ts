import { BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, Entity, JoinColumn } from "typeorm";
import { AssignmentType, CollaborationType, AssignmentState } from "../../shared/enums";
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
	templateName: string;

	@Column({ nullable: true })
	name?: string;

	@Column({ type: "enum", enum: AssignmentState, default: AssignmentState.IN_PROGRESS, nullable: true })
	state?: AssignmentState;

	@Column({ type: "enum", enum: AssignmentType, default: AssignmentType.HOMEWORK, nullable: true })
	type?: AssignmentType;

	@Column({ type: "enum", enum: CollaborationType, default: CollaborationType.GROUP_OR_SINGLE, nullable: true })
	collaboration?: CollaborationType;

	@Column({ nullable: true })
	points?: number;

	@Column({ nullable: true })
	bonusPoints?: number;

	@Column({ nullable: true })
	timespanDays?: number;

	toDto(): AssignmentTemplateDto {
		return {
			id: this.id,
			templateName: this.templateName,
			state: this.state,
			collaboration: this.collaboration,
			type: this.type,
			name: this.name,
			points: this.points,
			bonusPoints: this.bonusPoints,
			timespanDays: this.timespanDays
		};
	}
}
