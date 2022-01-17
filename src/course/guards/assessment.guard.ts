import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AssessmentRepository } from "../../assessment/repositories/assessment.repository";

/**
 * Attaches the `assessment` to the `request`.
 * Always returns `true`, unless the assessment does not exist.
 * Also ensures that the assessments belongs to `request.assignment`.
 */
@Injectable()
export class AssessmentGuard implements CanActivate {
	constructor(
		@InjectRepository(AssessmentRepository) private assessments: AssessmentRepository
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		if (!request.assignment) {
			throw new Error("AssignmentGuard is missing for this request handler");
		}

		const assessment = await this.assessments.findOneOrFail(request.params.assessmentId, {
			where: {
				assignmentId: request.assignment.id
			}
		});

		request.assessment = assessment;
		return true;
	}
}
