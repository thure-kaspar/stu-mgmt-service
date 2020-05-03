import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { Course } from "./course.entity";
import { Assessment } from "./assessment.entity";
import { AssignmentState, AssignmentType, CollaborationType } from "../../shared/enums";

@Entity("assignments")
export class Assignment extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	name: string;

	@Column({ type: "enum", enum: AssignmentState, default: AssignmentState.CLOSED })
	state: AssignmentState;

	@Column({ nullable: true })
	startDate: Date;

	@Column({ nullable: true })
	endDate: Date;

	@Column({ nullable: true })
	comment: string;

	@Column({ nullable: true })
	link: string;

	@Column({ type: "enum", enum: AssignmentType, default: AssignmentType.HOMEWORK })
	type: AssignmentType;

	@Column()
	points: number;

	@Column({ nullable: true })
	bonusPoints?: number;

	@Column({ type: "enum", enum: CollaborationType, default: CollaborationType.GROUP_OR_SINGLE })
	collaboration: CollaborationType;

	@ManyToOne(type => Course, course => course.assignments, { onDelete: "CASCADE" })
	@JoinColumn()
	course: Course;

	@Column()
	courseId: string;

	@OneToMany(type => Assessment, assessment => assessment.assignment)
    assessments: Assessment[];
}
