import { AssignmentDto } from "../../course/dto/assignment/assignment.dto";
import { AdmissionRule, OverallPercentRule, RuleType, PassedXPercentWithAtLeastYPercent } from "./abstract-rules";
import { OverallPercentRuleImpl } from "./impl/overall-percent";
import { PassedXPercentWithAtLeastYPercentImpl } from "./impl/passed-x-with-at-least-y";
import { AdmissionRuleDto } from "../dto/admission-rule.dto";

export abstract class AdmissionRuleFactory {

	static create(rule: AdmissionRuleDto, evaluatedAssignments: AssignmentDto[]): AdmissionRule {

		switch(rule.type) {
		case RuleType.REQUIRED_PERCENT_OVERALL: 
			return new OverallPercentRuleImpl(rule as OverallPercentRule, evaluatedAssignments);
		case RuleType.PASSED_X_PERCENT_WITH_AT_LEAST_Y_PERCENT: 
			return new PassedXPercentWithAtLeastYPercentImpl(rule as PassedXPercentWithAtLeastYPercent, evaluatedAssignments);
		default: 
			throw new Error("AdmissionRuleFactory: Failed to match RuleType.");
		}

	}

}
