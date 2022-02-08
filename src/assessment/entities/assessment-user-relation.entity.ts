import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Assignment } from "../../course/entities/assignment.entity";
import { User, UserId } from "../../shared/entities/user.entity";
import { Assessment } from "./assessment.entity";

@Entity("assessment_user_relations")
@Index("IDX_AssignmentId_UserId", ["assignmentId", "userId"], { unique: true })
export class AssessmentUserRelation {
	@ManyToOne(() => Assessment, assessment => assessment.assessmentUserRelations, {
		onDelete: "CASCADE"
	})
	@JoinColumn()
	assessment: Assessment;

	@PrimaryColumn()
	assessmentId: string;

	@ManyToOne(() => Assignment, { onDelete: "CASCADE" })
	assignment: Assignment;

	@Column()
	assignmentId: string;

	@ManyToOne(() => User, user => user.assessmentUserRelations, { onDelete: "CASCADE" })
	@JoinColumn()
	user: User;

	@PrimaryColumn()
	userId: UserId;

	/** Creates an instance of {@link AssessmentUserRelation}. */
	static create(
		assessmentId: string,
		assignmentId: string,
		userId: string
	): AssessmentUserRelation {
		const relation = new AssessmentUserRelation();
		relation.assessmentId = assessmentId;
		relation.assignmentId = assignmentId;
		relation.userId = userId;
		return relation;
	}
}
