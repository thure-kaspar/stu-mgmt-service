import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Course } from "../course/entities/course.entity";
import { User } from "../shared/entities/user.entity";

@Entity()
export class Activity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	user: User;

	@Column()
	userId: string;

	@ManyToOne(() => Course, { onDelete: "CASCADE" })
	course: Course;

	@Column()
	courseId: string;

	@CreateDateColumn()
	date: Date;

	static create(userId: string, courseId: string): Activity {
		const activity = new Activity();
		activity.userId = userId;
		activity.courseId = courseId;
		return activity;
	}
}
