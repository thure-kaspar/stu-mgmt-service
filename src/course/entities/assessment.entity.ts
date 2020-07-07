import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { Assignment } from "./assignment.entity";
import { Group } from "./group.entity";
import { AssessmentUserRelation } from "./assessment-user-relation.entity";
import { User } from "../../shared/entities/user.entity";
import { PartialAssessment } from "./partial-assessment.entity";

@Entity("assessments")
export class Assessment extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;
	
	@Column()
	achievedPoints: number;
	
	@Column({ nullable: true })
	comment: string;
	
	@ManyToOne(type => Assignment, assignment => assignment.assessments, { onDelete: "CASCADE" })
	assignment: Assignment;

	@Column()
	assignmentId: string;

	@ManyToOne(type => Group, group => group.assessments, { onDelete: "SET NULL"})
	group: Group;

	@Column({ nullable: true })
	groupId: string;

	@ManyToOne(type => User)
	creator: User;

	@Column({ nullable: false })
	creatorId: string;

	@OneToMany(type => PartialAssessment, partialAssessment => partialAssessment.assessment, { cascade: ["insert"] })
	partialAssessments: PartialAssessment[];

	// We need to assign the points to users individually, in case they switch group
	@OneToMany(type => AssessmentUserRelation, assessmentUserRelation => assessmentUserRelation.assessment, { cascade: ["insert"] })
	assessmentUserRelations: AssessmentUserRelation[];

}
