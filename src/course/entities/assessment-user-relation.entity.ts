import { BaseEntity, PrimaryColumn, Entity, Index, JoinColumn, ManyToOne, Column } from "typeorm";
import { Assessment } from "./assessment.entity";
import { User } from "../../shared/entities/user.entity";
import { Assignment } from "./assignment.entity";

@Entity("assessment_user_relations")
@Index("IDX_AssignmentId_UserId", ["assignmentId", "userId"], { unique: true })
export class AssessmentUserRelation extends BaseEntity {

	@ManyToOne(type => Assessment, assessment => assessment.assessmentUserRelations, { onDelete: "CASCADE" })
	@JoinColumn()
	assessment: Assessment;
	
	@PrimaryColumn()
	assessmentId: string;

	@ManyToOne(type => Assignment, { onDelete: "CASCADE" })
	assignment: Assignment;

	@Column()
	assignmentId: string;

	@ManyToOne(type => User, user => user.assessmentUserRelations, { onDelete: "CASCADE" })
	@JoinColumn()
	user: User;

	@PrimaryColumn()
	userId: string;
}
