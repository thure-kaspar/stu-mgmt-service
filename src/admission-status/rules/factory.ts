import { AssignmentDto } from "../../course/dto/assignment/assignment.dto";
import { AdmissionRuleDto } from "../dto/admission-rule.dto";
import {
	AdmissionRule,
	IndividualPercentWithAllowedFailures,
	OverallPercentRule,
	RuleType
} from "./abstract-rules";
import { IndividualPercentWithAllowedFailuresImpl } from "./impl/individual-percent-with-allowed-failures";
import { OverallPercentRuleImpl } from "./impl/overall-percent";

export abstract class AdmissionRuleFactory {
	static create(rule: AdmissionRuleDto, evaluatedAssignments: AssignmentDto[]): AdmissionRule {
		switch (rule.type) {
			case RuleType.REQUIRED_PERCENT_OVERALL:
				return new OverallPercentRuleImpl(rule as OverallPercentRule, evaluatedAssignments);
			case RuleType.INDIVIDUAL_PERCENT_WITH_ALLOWED_FAILURES:
				return new IndividualPercentWithAllowedFailuresImpl(
					rule as IndividualPercentWithAllowedFailures,
					evaluatedAssignments
				);
			default:
				throw new Error("AdmissionRuleFactory: Failed to match RuleType.");
		}
	}
}
