import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Assignment } from "../models/assignment.model";
import { AssignmentRepository } from "../repositories/assignment.repository";

/**
 * Attaches the `assignment` to the `request`.
 * Always returns `true`, unless the assignment does not exist.
 */
@Injectable()
export class AssignmentGuard implements CanActivate {
	constructor(
		@InjectRepository(AssignmentRepository) private assignments: AssignmentRepository
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		const assignment = await this.assignments.getAssignmentById(request.params.assignmentId);
		request.assignment = new Assignment(assignment);

		return true;
	}
}
