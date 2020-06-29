import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { DtoFactory } from "../../../shared/dto-factory";
import { AssignedEvaluatorFilter } from "../groups-with-assigned-evaluator/group-with-assigned-evaluator.dto";
import { UserWithAssignedEvaluatorDto } from "./user-with-assigned-evaluator.dto";
import { User } from "../../../shared/entities/user.entity";
import { UserRepository } from "../../../user/repositories/user.repository";
import { Assessment } from "../../entities/assessment.entity";

/**
 * Queries users of a course with their assigned evaluator for a particular assignment.
 * @returns ```[UserWithAssignedEvaluator[], number]```
 */
export class UsersWithAssignedEvaluatorQuery { 
	constructor(
		public readonly courseId: string,
		public readonly assignmentId: string,
		public readonly filter?: AssignedEvaluatorFilter
	) { }
}

@QueryHandler(UsersWithAssignedEvaluatorQuery)
export class UsersWithAssignedEvaluatorHandler implements IQueryHandler<UsersWithAssignedEvaluatorQuery> {

	constructor(@InjectRepository(User) private userRepo: UserRepository) { }

	async execute(query: UsersWithAssignedEvaluatorQuery): Promise<[UserWithAssignedEvaluatorDto[], number]> {
		const { courseId, assignmentId } = query;
		const { assignedEvaluatorId, excludeAlreadyReviewed, nameOfGroupOrUser, skip, take } = query.filter || { };
		
		// Query Users of course and join assessment allocation, if available to retrieve id of assigned evaluator.
		const userQuery = this.userRepo.createQueryBuilder("user")
			.leftJoinAndSelect("user.assessmentAllocations", "allocation", "allocation.assignmentId = :assignmentId", { assignmentId }) // Needs to be first param to allow reuse in subquery params :)
			.innerJoin("user.courseUserRelations", "courseRelations", "courseRelations.courseId = :courseId", { courseId });

		if (skip) userQuery.skip(skip);
		if (take) userQuery.take(take);

		if (assignedEvaluatorId) {
			// Filter by evaluator
			userQuery.andWhere("allocation.assignedEvaluatorId = :assignedEvaluatorId", { assignedEvaluatorId });
		}

		if (excludeAlreadyReviewed) {
			// Subquery to find all users that have been reviewed 
			const reviewedUsersSubQuery = this.userRepo.manager.getRepository(Assessment)
				.createQueryBuilder("assessment")
				.innerJoin("assessment.assessmentUserRelations", "aur", "aur.assignmentId = :assignmentId", { assignmentId })
				.select("aur.userId");

			// Exlude users that have been reviewed
			userQuery.andWhere("user.id NOT IN (" + reviewedUsersSubQuery.getSql() + ")");
		} else {
			// Join assessment, if it exists
			userQuery.leftJoinAndSelect("user.assessmentUserRelations", "aur", "aur.assignmentId = :assignmentId", { assignmentId });
		}
		
		if (nameOfGroupOrUser) {
			userQuery.andWhere("user.username ILIKE :name", { name: `%${nameOfGroupOrUser}%` });
		}

		const [users, count] = await userQuery.getManyAndCount();

		const dtos = users.map(user => ({
			user: DtoFactory.createUserDto(user),
			assignedEvaluatorId: user.assessmentAllocations[0]?.assignedEvaluatorId,
			assessmentId: user.assessmentUserRelations?.length > 0 ? user.assessmentUserRelations[0].assessmentId : undefined
		}));

		return [dtos, count];
	}

}
