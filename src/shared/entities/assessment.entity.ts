import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToMany, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Assignment } from "./assignment.entity";
import { Group } from "./group.entity";
import { AssessmentUserRelation } from "./assessment-user-relation.entity";
import { User } from "./user.entity";

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

	@OneToOne(type => Group, group => group.assessments, { onDelete: "SET NULL"})
	@JoinColumn()
	group: Group;

	@Column({ nullable: true })
	groupId: string;

	@ManyToMany(type => User)
	creator: User;

	@Column({ nullable: false })
	creatorId: string;

	// We need to assign the points to users individually, in case they switch group
	@OneToMany(type => AssessmentUserRelation, assessmentUserRelation => assessmentUserRelation.assessment, { cascade: true })
	assessmentUserRelations: AssessmentUserRelation[];

}
