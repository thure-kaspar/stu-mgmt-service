import { AssignmentDto } from "../../course/dto/assignment/assignment.dto";
import { AdmissionRule, OverallPercentRule, RuleType } from "./abstract-rules";
import { OverallPercentRuleImpl } from "./impl/overall-percent";

export abstract class AdmissionRuleFactory {

	static create(evaluatedAssignments: AssignmentDto[], rule: AdmissionRule): AdmissionRule {

		switch(rule.type) {
		case RuleType.REQUIRED_PERCENT_OVERALL: 
			return new OverallPercentRuleImpl(rule as OverallPercentRule, evaluatedAssignments);
		default: 
			throw new Error("AdmissionRuleFactory: Failed to match RuleType.");
		}

	}

}
