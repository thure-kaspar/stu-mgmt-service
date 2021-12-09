import { Column, Entity, Index, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Assignment } from "./assignment.entity";
import { CourseConfig } from "./course-config.entity";
import { Participant } from "./participant.entity";
import { Group } from "./group.entity";
import { LinkDto } from "../../shared/dto/link.dto";

export type CourseId = string;

@Entity("courses")
@Index("IDX_Shortname_Semester", ["shortname", "semester"], { unique: true })
export class Course {
	@PrimaryColumn()
	id: CourseId;

	@Column()
	shortname: string;

	@Column()
	semester: string;

	@Column()
	title: string;

	@Column()
	isClosed: boolean;

	@Column({ type: "json", nullable: true })
	links?: LinkDto[];

	@OneToMany(() => Participant, participants => participants.course, { cascade: ["insert"] })
	participants: Participant[];

	@OneToMany(() => Group, group => group.course)
	groups: Group[];

	@OneToMany(() => Assignment, assignment => assignment.course)
	assignments: Assignment[];

	@OneToOne(() => CourseConfig, config => config.course, { cascade: ["insert"] })
	config: CourseConfig;
}
