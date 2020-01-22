import { BaseEntity, Entity, Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Course } from "./course.entity";

@Entity("course_user_relations")
 export class CourseUserRelation extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(type => Course, course => course.courseUserRelations, { primary: true })
	course: Course;

	@Column()
	courseId: number;

	@ManyToOne(type => User, user => user.courseUserRelations, { primary: true })
	user: User;

	@Column()
	userId: string;

	@Column()
	role: string;  

	@CreateDateColumn()
	joinedAt: Date;

 }