import { BaseEntity, Entity, Column, CreateDateColumn, PrimaryColumn, ManyToMany, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Course } from "./course.entity";

@Entity("course_user_relations")
 export class CourseUserRelation extends BaseEntity {
	@ManyToOne(type => Course, course => course.courseUserRelations, { primary: true })
	course: Course;

	@ManyToOne(type => User, user => user.courseUserRelations, { primary: true })
	user: User;

	@Column()
	role: string;  

	@CreateDateColumn()
	joinedAt: Date;

 }