import { BaseEntity, PrimaryColumn, OneToOne, Entity, Index, JoinColumn } from "typeorm";
import { Assessment } from "./assessment.entity";
import { User } from "./user.entity";

@Entity("assessment_user_relations")
@Index("IDX_AssessmentId_UserId", ["assessmentId", "userId"], { unique: true })
export class AssessmentUserRelation extends BaseEntity {

	@OneToOne(type => Assessment, assessment => assessment.assessmentUserRelations)
	assessment: Assessment;
	
	@PrimaryColumn()
	assessmentId: string;

	@OneToOne(type => User, user => user.assessmentUserRelations, { onDelete: "CASCADE" })
	@JoinColumn()
	user: User;

	@PrimaryColumn()
	userId: string;
}
