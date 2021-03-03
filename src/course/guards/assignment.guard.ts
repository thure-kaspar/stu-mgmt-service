import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Assignment as AssignmentEntity } from "../entities/assignment.entity";
import { AssignmentRepository } from "../repositories/assignment.repository";
import { Assignment } from "../models/assignment.model";

/**
 * Attaches the `assignment` to the `request`.
 * Always returns `true`, unless the assignment does not exist.
 */
@Injectable()
export class AssignmentGuard implements CanActivate {
	constructor(@InjectRepository(AssignmentEntity) private assignments: AssignmentRepository) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		const assignment = await this.assignments.getAssignmentById(request.params.assignmentId);
		request.assignment = new Assignment(assignment);

		return true;
	}
}
