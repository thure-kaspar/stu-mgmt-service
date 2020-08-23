import { IsDefined, Max, Min } from "class-validator";
import { AssessmentDto } from "../../course/dto/assessment/assessment.dto";
import { ParticipantDto } from "../../course/dto/course-participant/participant.dto";
import { UserId } from "../../shared/entities/user.entity";
import { AssignmentType } from "../../shared/enums";
import { RoundingBehavior } from "../../utils/math";
import { AssignmentDto } from "../../course/dto/assignment/assignment.dto";

export enum RuleType {
	X_PERCENT_OF_Y = "X_PERCENT_OF_Y",
	OVERALL_PERCENT = "OVERALL_PERCENT",
	INDIVIDUAL_PERCENT = "INDIVIDUAL_PERCENT"
}

export class RuleCheckResult {
	achievedPoints: number | number[];
	achievedPercent: number | number[];
	passed: boolean | boolean[];
	comment?: string;
}

export abstract class AdmissionRule {
	readonly type: RuleType;
	assignmentType: AssignmentType;
	protected assignments: AssignmentDto[];

	@Min(0)
	@Max(100)
	requiredPercent: number;
	pointsRounding: RoundingBehavior;

	ignoredParticipants?: UserId[];

	/**
	 * Checks if the given participant fulfills this rule.
	 * @param assessments Participant's assessments of EVALUATED assignments!
	 * @param participant
	 */
	abstract check(assessments: AssessmentDto[], participant: ParticipantDto): RuleCheckResult;

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
			achievedPoints: 0,
			achievedPercent: 100,
			passed: true,
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
	type = RuleType.OVERALL_PERCENT;
}

export abstract class IndividualPercentRule extends AdmissionRule {
	type = RuleType.OVERALL_PERCENT;
}

