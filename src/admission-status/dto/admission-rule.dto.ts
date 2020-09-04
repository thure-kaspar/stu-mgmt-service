import { Max, Min } from "class-validator";
import { AssignmentType } from "../../shared/enums";
import { RoundingBehavior } from "../../utils/math";
import { RuleType } from "../rules/abstract-rules";

export class AdmissionRuleDto {
	readonly type: RuleType;
	assignmentType: AssignmentType;

	@Min(0)
	@Max(100)
	requiredPercent: number;
	achievedPercentRounding: RoundingBehavior;
}

export class IndividualPercentWithAllowedFailuresRuleDto extends AdmissionRuleDto {
	readonly type = RuleType.INDIVIDUAL_PERCENT_WITH_ALLOWED_FAILURES;

	@Min(1)
	allowedFailures: number;
}

export class OverallPercentRuleDto extends AdmissionRuleDto {
	readonly type = RuleType.REQUIRED_PERCENT_OVERALL;
}

export function toString(rule: AdmissionRuleDto): string {
	const baseString = `${rule.type} ### ${rule.assignmentType}`;
	const requiredPercent = `Required: ${rule.requiredPercent}%`;
	const pointsRounding = `Rounding: ${rule.achievedPercentRounding.type}` + (rule.achievedPercentRounding.decimals ? ` (${rule.achievedPercentRounding.decimals})` : "");

	let result = baseString + " ### " + requiredPercent + " ### " + pointsRounding;

	if (rule.type === RuleType.INDIVIDUAL_PERCENT_WITH_ALLOWED_FAILURES) {
		const ruleAs = (rule as IndividualPercentWithAllowedFailuresRuleDto);
		result += ` ### Allowed failures: ${ruleAs.allowedFailures}`;
	}

	return result;
}
