import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from "typeorm";
import { Assignment } from "../../course/entities/assignment.entity";
import { Group, GroupId } from "../../course/entities/group.entity";
import { User, UserId } from "../../shared/entities/user.entity";
import { AssessmentUserRelation } from "./assessment-user-relation.entity";
import { PartialAssessment } from "./partial-assessment.entity";

@Entity("assessments")
export class Assessment {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "float", nullable: true })
	achievedPoints?: number;

	@Column({ default: false })
	isDraft: boolean;

	@Column({ nullable: true })
	comment: string;

	@ManyToOne(() => Assignment, assignment => assignment.assessments, { onDelete: "CASCADE" })
	assignment: Assignment;

	@Column()
	assignmentId: string;

	@ManyToOne(() => Group, group => group.assessments, { onDelete: "SET NULL" })
	group: Group;

	@Column({ nullable: true })
	groupId: GroupId;

	@ManyToOne(() => User)
	creator: User;

	@Column({ nullable: false })
	creatorId: string;

	@CreateDateColumn()
	creationDate: Date;

	@ManyToOne(() => User)
	lastUpdatedBy?: User;

	@Column({ nullable: true })
	lastUpdatedById?: UserId;

	@UpdateDateColumn({ nullable: true })
	updateDate?: Date;

	@OneToMany(() => PartialAssessment, partialAssessment => partialAssessment.assessment, {
		cascade: ["insert"]
	})
	partialAssessments: PartialAssessment[];

	// We need to assign the points to users individually, in case they switch group
	@OneToMany(
		() => AssessmentUserRelation,
		assessmentUserRelation => assessmentUserRelation.assessment,
		{ cascade: ["insert"] }
	)
	assessmentUserRelations: AssessmentUserRelation[];
}
