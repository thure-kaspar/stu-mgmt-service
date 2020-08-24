import { IsDefined, Max, Min } from "class-validator";
import { AssessmentDto } from "../../course/dto/assessment/assessment.dto";
import { ParticipantDto } from "../../course/dto/course-participant/participant.dto";
import { UserId } from "../../shared/entities/user.entity";
import { AssignmentType } from "../../shared/enums";
import { RoundingBehavior } from "../../utils/math";
import { AssignmentDto } from "../../course/dto/assignment/assignment.dto";
import { AssignmentId } from "../../course/entities/assignment.entity";

export enum RuleType {
	X_PERCENT_OF_Y = "X_PERCENT_OF_Y",
	REQUIRED_PERCENT = "REQUIRED_PERCENT",
	REQUIRED_PERCENT_OVERALL = "REQUIRED_PERCENT_OVERALL",
}

export abstract class RuleCheckResult {
	passed: boolean;
	achievedPoints: number;
	achievedPercent: number;
	comment?: string;
}

export abstract class AdmissionRule {
	readonly type: RuleType;
	assignmentType: AssignmentType;

	@Min(0)
	@Max(100)
	requiredPercent: number;
	pointsRounding: RoundingBehavior;

	ignoredParticipants?: UserId[];

	/**
	 * Filters assignments by the `AssignmentType` that is used by this rule.
	 */
	protected filterAssignmentsByType(assignments: AssignmentDto[]): AssignmentDto[] {
		return assignments.filter(a => a.type === this.assignmentType);
	}

	protected shouldBeIgnoredForParticipant(participant: ParticipantDto): boolean {
		return !!this.ignoredParticipants?.find(userId => userId === participant.userId);
	}

	protected ignoreForParticipant(): RuleCheckResult {
		return {
			passed: true,
			achievedPoints: 0,
			achievedPercent: 100,
			comment: "Rule ignored for this participant."
		};
	}
}

export abstract class XPercentOfYRule extends AdmissionRule {
	type = RuleType.X_PERCENT_OF_Y;

	@Min(0)
	@Max(100)
	assignmentsPercent: number;

	@IsDefined()
	assignmentsRounding: RoundingBehavior;
}

export abstract class OverallPercentRule extends AdmissionRule {
	type = RuleType.REQUIRED_PERCENT_OVERALL;
}

export abstract class RequiredPercentRule extends AdmissionRule {
	type = RuleType.REQUIRED_PERCENT;
}

