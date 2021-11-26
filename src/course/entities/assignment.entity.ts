import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Assessment } from "../../assessment/entities/assessment.entity";
import { LinkDto } from "../../shared/dto/link.dto";
import { SubmissionConfigDto } from "src/shared/dto/submission-config.dto";
import { AssignmentState, AssignmentType, CollaborationType } from "../../shared/enums";
import { Course, CourseId } from "./course.entity";

export type AssignmentId = string;

@Entity("assignments")
export class Assignment {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	name: string;

	@Column({ type: "enum", enum: AssignmentState, default: AssignmentState.CLOSED })
	state: AssignmentState;

	@Column({ nullable: true })
	startDate?: Date;

	@Column({ nullable: true })
	endDate?: Date;

	@Column({ nullable: true })
	comment?: string;

	@Column({ type: "json", nullable: true })
	links?: LinkDto[];

	@Column({ type: "json", nullable: true })
	configs?: SubmissionConfigDto[];

	@Column({ type: "enum", enum: AssignmentType, default: AssignmentType.HOMEWORK })
	type: AssignmentType;

	@Column({ type: "float" })
	points: number;

	@Column({ type: "float", nullable: true })
	bonusPoints?: number;

	@Column({ type: "enum", enum: CollaborationType, default: CollaborationType.GROUP_OR_SINGLE })
	collaboration: CollaborationType;

	@ManyToOne(type => Course, course => course.assignments, { onDelete: "CASCADE" })
	@JoinColumn()
	course: Course;

	@Column()
	courseId: CourseId;

	@OneToMany(type => Assessment, assessment => assessment.assignment)
	assessments: Assessment[];
}
