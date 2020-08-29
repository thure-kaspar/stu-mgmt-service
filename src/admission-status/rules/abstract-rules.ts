import { IsDefined, Max, Min } from "class-validator";
import { AssessmentDto } from "../../course/dto/assessment/assessment.dto";
import { AssignmentDto } from "../../course/dto/assignment/assignment.dto";
import { RoundingBehavior } from "../../utils/math";
import { AdmissionRuleDto } from "../dto/admission-rule.dto";
import { RuleCheckResult } from "../dto/rule-check-result.dto";

export enum RuleType {
	PASSED_X_PERCENT_WITH_AT_LEAST_Y_PERCENT = "PASSED_X_PERCENT_WITH_AT_LEAST_Y_PERCENT",
	REQUIRED_PERCENT_OVERALL = "REQUIRED_PERCENT_OVERALL",
}

export abstract class AdmissionRule extends AdmissionRuleDto {

	abstract check(assessments: AssessmentDto[]): RuleCheckResult;

	/**
	 * Filters assignments by the `AssignmentType` that is used by this rule.
	 */
	protected filterAssignmentsByType(assignments: AssignmentDto[]): AssignmentDto[] {
		return assignments.filter(a => a.type === this.assignmentType);
	}

	/**
	 * Filters assessments by the `AssignmentType` that is used by this rule.
	 */
	protected filterAssessmentsByType(assessments: AssessmentDto[]): AssessmentDto[] {
		return assessments.filter(a => a.assignment.type === this.assignmentType);
	}
	
}

export abstract class PassedXPercentWithAtLeastYPercent extends AdmissionRule {
	type = RuleType.PASSED_X_PERCENT_WITH_AT_LEAST_Y_PERCENT;

	@Min(0)
	@Max(100)
	passedAssignmentsPercent: number;

	@IsDefined()
	passedAssignmentsRounding: RoundingBehavior;
}

export abstract class OverallPercentRule extends AdmissionRule {
	type = RuleType.REQUIRED_PERCENT_OVERALL;
}

