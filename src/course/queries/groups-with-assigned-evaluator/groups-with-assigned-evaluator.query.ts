import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DtoFactory } from "../../../shared/dto-factory";
import { Assessment } from "../../entities/assessment.entity";
import { AssignmentRegistration } from "../../entities/assignment-group-registration.entity";
import { CourseId } from "../../entities/course.entity";
import {
	AssignedEvaluatorFilter,
	GroupWithAssignedEvaluatorDto
} from "./group-with-assigned-evaluator.dto";

/**
 * Queries groups of a course with their assigned evaluator for a particular assignment.
 * @returns ```[GroupWithAssignedEvaluatorDto[], number]```
 */
export class GroupsWithAssignedEvaluatorQuery {
	constructor(
		public readonly courseId: CourseId,
		public readonly assignmentId: string,
		public readonly filter?: AssignedEvaluatorFilter
	) {}
}

@QueryHandler(GroupsWithAssignedEvaluatorQuery)
export class GroupsWithAssignedEvaluatorHandler
	implements IQueryHandler<GroupsWithAssignedEvaluatorQuery> {
	constructor(
		@InjectRepository(AssignmentRegistration)
		private registrations: Repository<AssignmentRegistration>
	) {}

	async execute(
		query: GroupsWithAssignedEvaluatorQuery
	): Promise<[GroupWithAssignedEvaluatorDto[], number]> {
		const { courseId, assignmentId } = query;
		const { assignedEvaluatorId, excludeAlreadyReviewed, nameOfGroupOrUser, skip, take } =
			query.filter || {};

		// Query groups of course and join assessment allocation, if available to retrieve id of assigned evaluator.
		const groupQuery = this.registrations
			.createQueryBuilder("registration")
			.where("registration.assignmentId = :assignmentId", { assignmentId })
			.andWhere("group.courseId = :courseId", { courseId })
			.innerJoinAndSelect("registration.group", "group")
			.leftJoinAndSelect("group.userGroupRelations", "userGroupRelation")
			.innerJoinAndSelect("userGroupRelation.participant", "participant")
			.innerJoinAndSelect("participant.user", "user")
			.leftJoinAndSelect(
				"group.assessmentAllocations",
				"allocation",
				"allocation.assignmentId = :assignmentId",
				{ assignmentId }
			)
			.skip(skip)
			.take(take);

		if (assignedEvaluatorId) {
			// Filter by evaluator
			groupQuery.andWhere("allocation.assignedEvaluatorId = :assignedEvaluatorId", {
				assignedEvaluatorId
			});
		}

		if (nameOfGroupOrUser) {
			groupQuery.andWhere("group.name ILIKE :name", { name: `%${nameOfGroupOrUser}%` });
		}

		if (excludeAlreadyReviewed) {
			// Subquery to find all ids of groups that have been reviewed
			const reviewedGroupsSubQuery = this.registrations.manager
				.getRepository(Assessment)
				.createQueryBuilder("assessment")
				.where("assessment.assignmentId = :assignmentId", { assignmentId })
				.andWhere("assessment.groupId IS NOT NULL")
				.select("assessment.groupId");

			// Exclude groups that have already been reviewed
			groupQuery.andWhere("group.id NOT IN (" + reviewedGroupsSubQuery.getSql() + ")");
		} else {
			// Join assessment, if it exists
			groupQuery.leftJoinAndSelect(
				"group.assessments",
				"assessment",
				"assessment.assignmentId = :assignmentId",
				{ assignmentId }
			);
		}

		const [registrations, count] = await groupQuery.getManyAndCount();

		const dtos = registrations.map(({ group }) => ({
			group: DtoFactory.createGroupDto(group),
			assignedEvaluatorId: group.assessmentAllocations[0]?.assignedEvaluatorId,
			assessmentId: group.assessments?.length > 0 ? group.assessments[0].id : undefined
		}));

		return [dtos, count];
	}
}
