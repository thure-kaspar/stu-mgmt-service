import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Assignment } from "./assignment.entity";
import { Group } from "./group.entity";

@Entity("assessments")
export class Assessment extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;
	
	@Column()
	achievedPoints: number;
	
	@Column({ nullable: true })
	comment: string;
	
	@OneToOne(type => Assignment, assignment => assignment.assessments)
	assignment: Assignment;

	@Column()
	assignmentId: string;

	@OneToOne(type => Group, group => group.assessments)
	group: Group;

	@Column({ nullable: true })
	groupId: number;

	// We need to assign the points to users individually, in case they switch group
	// users: User[];

}