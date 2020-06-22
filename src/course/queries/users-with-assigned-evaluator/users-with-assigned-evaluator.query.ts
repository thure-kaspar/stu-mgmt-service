import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { DtoFactory } from "../../../shared/dto-factory";
import { AssignedEvaluatorFilter } from "../groups-with-assigned-evaluator/group-with-assigned-evaluator.dto";
import { UserWithAssignedEvaluatorDto } from "./user-with-assigned-evaluator.dto";
import { User } from "../../../shared/entities/user.entity";
import { UserRepository } from "../../../user/repositories/user.repository";

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
		const { assignedEvaluatorId, skip, take } = query.filter || { };
		
		// Query Users of course and join assessment allocation, if available to retrieve id of assigned evaluator.
		const userQuery = this.userRepo.createQueryBuilder("user")
			.innerJoin("user.courseUserRelations", "courseRelations", "courseRelations.courseId = :courseId", { courseId })
			.leftJoinAndSelect("user.assessmentAllocations", "allocation", "allocation.assignmentId = :assignmentId", { assignmentId });

		if (skip) userQuery.skip(skip);
		if (take) userQuery.take(take);
		if (assignedEvaluatorId) {
			// Filter by evaluator
			userQuery.andWhere("allocation.assignedEvaluatorId = :assignedEvaluatorId", { assignedEvaluatorId });
		}

		const [users, count] = await userQuery.getManyAndCount();
		
		const dtos = users.map(user => ({
			user: DtoFactory.createUserDto(user),
			assignedEvaluatorId: user.assessmentAllocations[0]?.assignedEvaluatorId
		}));

		return [dtos, count];
	}

}
