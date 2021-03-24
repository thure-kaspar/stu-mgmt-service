import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn
} from "typeorm";
import { AssignmentId } from "../course/entities/assignment.entity";
import { Course, CourseId } from "../course/entities/course.entity";
import { Group, GroupId } from "../course/entities/group.entity";
import { LinkDto } from "../shared/dto/link.dto";
import { User, UserId } from "../shared/entities/user.entity";
import { ToDto } from "../shared/interfaces/to-dto.interface";
import { SubmissionDto } from "./submission.dto";

@Entity()
export class Submission implements ToDto<SubmissionDto> {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	assignmentId: AssignmentId;

	@ManyToOne(type => User, { onDelete: "CASCADE" })
	user: User;

	@Column()
	userId: UserId;

	@ManyToOne(type => Course, { onDelete: "CASCADE" })
	course: Course;

	@Column()
	courseId: CourseId;

	@CreateDateColumn()
	date: Date;

	@ManyToOne(type => Group, { onDelete: "SET NULL" })
	group: Group;

	@Column({ nullable: true })
	groupId?: GroupId;

	@Column({ type: "json", nullable: true })
	links?: LinkDto[];

	@Column({ type: "json", nullable: true })
	payload?: any;

	toDto(): SubmissionDto {
		return {
			assignmentId: this.assignmentId,
			userId: this.userId,
			displayName: this.user.displayName,
			date: this.date,
			groupId: this.groupId,
			groupName: this.group?.name,
			links: this.links,
			payload: this.payload
		};
	}
}
