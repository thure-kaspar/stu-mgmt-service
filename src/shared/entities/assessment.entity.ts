import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { Assignment } from "./assignment.entity";
import { Group } from "./group.entity";
import { User } from "./user.entity";
import { AssessmentUserRelation } from "./assessment-user-relation.entity";

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
	groupId: string;

	// We need to assign the points to users individually, in case they switch group
	@OneToMany(type => AssessmentUserRelation, assessmentUserRelation => assessmentUserRelation.assessment)
	assessmentUserRelations: AssessmentUserRelation[];

}