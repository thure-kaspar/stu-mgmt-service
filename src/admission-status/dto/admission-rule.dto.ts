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
