import { Repository, EntityRepository } from "typeorm";
import { AssessmentUserRelation } from "../entities/assessment-user-relation.entity";

@EntityRepository(AssessmentUserRelation)
export class AssessmentUserRelationRepository extends Repository<AssessmentUserRelation> {

	async createAssessmentUserRelations(assessmentId: string, userIds: string[]): Promise<AssessmentUserRelation[]> {
		const assessmentUserRelations: AssessmentUserRelation[] = [];
		userIds.forEach(userId => {
			const relation = new AssessmentUserRelation();
			relation.assessmentId = assessmentId;
			relation.userId = userId;

			assessmentUserRelations.push(relation);
		});
		return this.save(assessmentUserRelations);
	}

}
