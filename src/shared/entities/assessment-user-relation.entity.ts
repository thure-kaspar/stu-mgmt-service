import { BaseEntity, PrimaryColumn, OneToOne, Entity } from "typeorm";
import { Assessment } from "./assessment.entity";
import { User } from "./user.entity";

@Entity("assessment_user_relations")
export class AssessmentUserRelation extends BaseEntity {

	@OneToOne(type => Assessment, assessment => assessment.assessmentUserRelations)
	assessment: Assessment;
	
	@PrimaryColumn()
	assessmentId: string;

	@OneToOne(type => User, user => user.assessmentUserRelations)
	user: User;

	@PrimaryColumn()
	userId: string;
}