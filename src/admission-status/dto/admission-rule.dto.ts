import { RuleType } from "../rules/abstract-rules";
import { AssignmentType } from "../../shared/enums";
import { Min, Max, IsDefined } from "class-validator";
import { RoundingBehavior } from "../../utils/math";

export class AdmissionRuleDto {
	readonly type: RuleType;
	assignmentType: AssignmentType;

	@Min(0)
	@Max(100)
	requiredPercent: number;
	pointsRounding: RoundingBehavior;
}

export class PassedXPercentWithAtLeastYPercentRuleDto extends AdmissionRuleDto {
	readonly type = RuleType.PASSED_X_PERCENT_WITH_AT_LEAST_Y_PERCENT;

	@Min(0)
	@Max(100)
	passedAssignmentsPercent: number;

	@IsDefined()
	passedAssignmentsRounding: RoundingBehavior;
}

export class OverallPercentRuleDto extends AdmissionRuleDto {
	readonly type = RuleType.REQUIRED_PERCENT_OVERALL;
}

export function toString(rule: AdmissionRuleDto): string {
	const baseString = `${rule.type} ### ${rule.assignmentType}`;
	const requiredPercent = `Required: ${rule.requiredPercent}%`;
	const pointsRounding = `Rounding: ${rule.pointsRounding.type}` + (rule.pointsRounding.decimals ? ` (${rule.pointsRounding.decimals})` : "");

	let result = baseString + " ### " + requiredPercent + " ### " + pointsRounding;

	if (rule.type === RuleType.PASSED_X_PERCENT_WITH_AT_LEAST_Y_PERCENT) {
		const ruleAs = (rule as PassedXPercentWithAtLeastYPercentRuleDto);
		result += ` ### Required Assignments: ${ruleAs.passedAssignmentsPercent}%`;
		result += ` ### Assignments rounding: ${ruleAs.passedAssignmentsRounding.type}%` + (ruleAs.passedAssignmentsRounding.decimals ? ` (${ruleAs.passedAssignmentsRounding.decimals})` : "");
	}

	return result;
}
