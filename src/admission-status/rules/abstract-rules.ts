import { AssessmentDto } from "../../assessment/dto/assessment.dto";
import { AssignmentDto } from "../../course/dto/assignment/assignment.dto";
import { AssignmentState } from "../../shared/enums";
import { AdmissionRuleDto } from "../dto/admission-rule.dto";
import { RuleCheckResult } from "../dto/rule-check-result.dto";

export enum RuleType {
	INDIVIDUAL_PERCENT_WITH_ALLOWED_FAILURES = "INDIVIDUAL_PERCENT_WITH_ALLOWED_FAILURES",
	REQUIRED_PERCENT_OVERALL = "REQUIRED_PERCENT_OVERALL"
}

export abstract class AdmissionRule extends AdmissionRuleDto {
	abstract check(assessments: AssessmentDto[]): RuleCheckResult;

	/**
	 * Filters assignments by the `AssignmentType` that is used by this rule.
	 */
	protected filterAssignmentsByType(assignments: AssignmentDto[]): AssignmentDto[] {
		return assignments.filter(
			a => a.type === this.assignmentType && a.state === AssignmentState.EVALUATED
		);
	}

	/**
	 * Filters assessments by the `AssignmentType` that is used by this rule.
	 */
	protected filterAssessmentsByType(assessments: AssessmentDto[]): AssessmentDto[] {
		return assessments.filter(
			a =>
				a.assignment.type === this.assignmentType &&
				a.assignment.state === AssignmentState.EVALUATED
		);
	}
}

export abstract class IndividualPercentWithAllowedFailures extends AdmissionRule {
	type = RuleType.INDIVIDUAL_PERCENT_WITH_ALLOWED_FAILURES;
	allowedFailures: number;
}

export abstract class OverallPercentRule extends AdmissionRule {
	type = RuleType.REQUIRED_PERCENT_OVERALL;
}
