import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from "typeorm";
import { Course } from "./course.entity";
import { Assessment } from "./assessment.entity";

@Entity("assignments")
export class Assignment extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	name: string;

	@Column({ nullable: true })
	comment: string;

	@Column({ nullable: true })
	link: string;

	@Column()
	type: string;

	@Column()
	maxPoints: number;

	@OneToOne(type => Course, course => course.assignments)
	course: Course;

	@Column()
	courseId: string;

	@OneToMany(type => Assessment, assessment => assessment.assignment)
    assessments: Assessment[];
}