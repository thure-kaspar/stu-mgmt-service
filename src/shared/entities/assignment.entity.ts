import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from "typeorm";
import { Course } from "./course.entity";
import { Assessment } from "./assessment.entity";
import { AssignmentStates, AssignmentTypes } from "../enums";

@Entity("assignments")
export class Assignment extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	name: string;

	@Column()
	state: AssignmentStates;

	@Column({ nullable: true })
	startDate: Date;

	@Column({ nullable: true })
	endDate: Date;

	@Column({ nullable: true })
	comment: string;

	@Column({ nullable: true })
	link: string;

	@Column()
	type: AssignmentTypes;

	@Column()
	maxPoints: number;

	@OneToOne(type => Course, course => course.assignments)
	course: Course;

	@Column()
	courseId: string;

	@OneToMany(type => Assessment, assessment => assessment.assignment)
    assessments: Assessment[];
}