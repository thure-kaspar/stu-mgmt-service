import { BaseEntity, PrimaryColumn, Entity, Index, JoinColumn, ManyToMany, ManyToOne } from "typeorm";
import { Assessment } from "./assessment.entity";
import { User } from "../../shared/entities/user.entity";

@Entity("assessment_user_relations")
@Index("IDX_AssessmentId_UserId", ["assessmentId", "userId"], { unique: true })
export class AssessmentUserRelation extends BaseEntity {

	@ManyToOne(type => Assessment, assessment => assessment.assessmentUserRelations, { onDelete: "CASCADE" })
	@JoinColumn()
	assessment: Assessment;
	
	@PrimaryColumn()
	assessmentId: string;

	@ManyToMany(type => User, user => user.assessmentUserRelations, { onDelete: "CASCADE" })
	@JoinColumn()
	user: User;

	@PrimaryColumn()
	userId: string;
}
