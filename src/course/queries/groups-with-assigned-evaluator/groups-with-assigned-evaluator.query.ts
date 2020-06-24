import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { GroupWithAssignedEvaluatorDto, AssignedEvaluatorFilter } from "./group-with-assigned-evaluator.dto";
import { Group } from "../../entities/group.entity";
import { GroupRepository } from "../../repositories/group.repository";
import { DtoFactory } from "../../../shared/dto-factory";
import { Assessment } from "../../entities/assessment.entity";

/**
 * Queries groups of a course with their assigned evaluator for a particular assignment.
 * @returns ```[GroupWithAssignedEvaluatorDto[], number]```
 */
export class GroupsWithAssignedEvaluatorQuery { 
	constructor(
		public readonly courseId: string,
		public readonly assignmentId: string,
		public readonly filter?: AssignedEvaluatorFilter
	) { }
}

@QueryHandler(GroupsWithAssignedEvaluatorQuery)
export class GroupsWithAssignedEvaluatorHandler implements IQueryHandler<GroupsWithAssignedEvaluatorQuery> {

	constructor(@InjectRepository(Group) private groupRepo: GroupRepository) { }

	async execute(query: GroupsWithAssignedEvaluatorQuery): Promise<[GroupWithAssignedEvaluatorDto[], number]> {
		const { courseId, assignmentId } = query;
		const { assignedEvaluatorId, excludeAlreadyReviewed, nameOfGroupOrUser, skip, take } = query.filter || { };
		
		// Query groups of course and join assessment allocation, if available to retrieve id of assigned evaluator.
		const groupQuery = this.groupRepo.createQueryBuilder("group")
			.where("group.courseId = :courseId", { courseId })
			.leftJoinAndSelect("group.assessmentAllocations", "allocation", "allocation.assignmentId = :assignmentId", { assignmentId });

		if (skip) groupQuery.skip(skip);
		if (take) groupQuery.take(take);

		if (assignedEvaluatorId) {
			// Filter by evaluator
			groupQuery.andWhere("allocation.assignedEvaluatorId = :assignedEvaluatorId", { assignedEvaluatorId });
		}

		if (nameOfGroupOrUser) {
			groupQuery.andWhere("group.name ILIKE :name", { name: `%${nameOfGroupOrUser}%`});
		}

		if (excludeAlreadyReviewed) {
			// Subquery to find all ids of groups that have been reviewed
			const reviewedGroupsSubQuery = this.groupRepo.manager.getRepository(Assessment).createQueryBuilder("assessment")
				.where("assessment.assignmentId = :assignmentId", { assignmentId })
				.andWhere("assessment.groupId != null")
				.select("assessment.groupId");

			// Exclude groups that have already been reviewed
			groupQuery.andWhere("group.id NOT IN (" + reviewedGroupsSubQuery.getSql() + ")");
		}

		const [groups, count] = await groupQuery.getManyAndCount();
		
		const dtos = groups.map(group => ({
			group: DtoFactory.createGroupDto(group),
			assignedEvaluatorId: group.assessmentAllocations[0]?.assignedEvaluatorId
		}));

		return [dtos, count];
	}

}
