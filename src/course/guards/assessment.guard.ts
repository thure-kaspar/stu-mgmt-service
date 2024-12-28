import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AssessmentRepository } from "../../assessment/repositories/assessment.repository";
import { Participant } from "../models/participant.model";

/**
 * Attaches the `assessment` to the `request`.
 * - Ensures that the assessments belongs to `request.assignment`
 * - If requested by `STUDENT` role, ensures that student is target of assessment
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

		const assessment = await this.assessments.findOneOrFail({
			where: {
				assignmentId: request.assignment.id
			},
			relations: ["assessmentUserRelations"]
		});

		const participant: Participant = request.participant;

		if (participant.isStudent()) {
			if (!assessment.assessmentUserRelations.find(r => r.userId === participant.userId)) {
				throw new ForbiddenException(
					"Students can not view assessments of other students."
				);
			}
		}

		request.assessment = assessment;
		return true;
	}
}
