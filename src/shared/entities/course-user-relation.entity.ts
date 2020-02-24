import { BaseEntity, Entity, Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn,  JoinColumn, Index } from "typeorm";
import { User } from "./user.entity";
import { Course } from "./course.entity";
import { UserRoles } from "../enums";

@Entity("course_user_relations")
@Index(["courseId", "userId"], { unique: true }) // Unique index to prevent user from joining same course multiple times
 export class CourseUserRelation extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(type => Course, course => course.courseUserRelations, { primary: true, onDelete: "CASCADE" })
	@JoinColumn()
	course: Course;

	@Column()
	courseId: string;

	@ManyToOne(type => User, user => user.courseUserRelations, { primary: true, onDelete: "CASCADE" })
	@JoinColumn()
	user: User;

	@Column()
	userId: string;

	@Column()
	role: UserRoles;  

	@CreateDateColumn()
	joinedAt: Date;

 }
