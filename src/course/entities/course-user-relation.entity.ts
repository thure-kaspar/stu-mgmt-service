import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../shared/entities/user.entity";
import { CourseRole } from "../../shared/enums";
import { Course, CourseId } from "./course.entity";

@Entity("course_user_relations")
@Index("IDX_CourseId_UserId", ["courseId", "userId"], { unique: true }) // Unique index to prevent user from joining same course multiple times
export class CourseUserRelation {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(type => Course, course => course.courseUserRelations, { primary: true, onDelete: "CASCADE" })
	@JoinColumn()
	course: Course;

	@Column()
	courseId: CourseId;

	@ManyToOne(type => User, user => user.courseUserRelations, { primary: true, onDelete: "CASCADE" })
	@JoinColumn()
	user: User;

	@Column()
	userId: string;

	@Column({ type: "enum", enum: CourseRole, default: CourseRole.STUDENT })
	role: CourseRole;  

	@CreateDateColumn()
	joinedAt: Date;

}
