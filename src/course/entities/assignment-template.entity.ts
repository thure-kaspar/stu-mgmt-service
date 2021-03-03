import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AssignmentState, AssignmentType, CollaborationType } from "../../shared/enums";
import { AssignmentTemplateDto } from "../dto/course-config/assignment-template.dto";
import { CourseConfig } from "./course-config.entity";

@Entity()
export class AssignmentTemplate {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(type => CourseConfig, courseConfig => courseConfig.assignmentTemplates, {
		onDelete: "CASCADE"
	})
	@JoinColumn()
	courseConfig: CourseConfig;

	@Column()
	courseConfigId: number;

	@Column()
	templateName: string;

	@Column({ nullable: true })
	name?: string;

	@Column({
		type: "enum",
		enum: AssignmentState,
		default: AssignmentState.IN_PROGRESS,
		nullable: true
	})
	state?: AssignmentState;

	@Column({
		type: "enum",
		enum: AssignmentType,
		default: AssignmentType.HOMEWORK,
		nullable: true
	})
	type?: AssignmentType;

	@Column({
		type: "enum",
		enum: CollaborationType,
		default: CollaborationType.GROUP_OR_SINGLE,
		nullable: true
	})
	collaboration?: CollaborationType;

	@Column({ type: "float", nullable: true })
	points?: number;

	@Column({ type: "float", nullable: true })
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
