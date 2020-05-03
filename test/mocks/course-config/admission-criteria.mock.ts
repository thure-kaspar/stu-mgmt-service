import { AdmissionCriteriaDto, Rule, RuleScope } from "../../../src/course/dto/course-config/admission-criteria.dto";
import { AssignmentType } from "../../../src/shared/enums";

export const RULE_OVERALL_HOMEWORK_50_PERCENT: Rule = {
	scope: RuleScope.OVERALL,
	type: AssignmentType.HOMEWORK,
	requiredPercent: 50
};

export const RULE_INDIVIDUAL_HOMEWORK_30_PERCENT: Rule = {
	scope: RuleScope.INDIVIDUAL,
	type: AssignmentType.HOMEWORK,
	requiredPercent: 30
};

export const RULE_OVERALL_TESTAT_50_PERCENT: Rule = {
	scope: RuleScope.OVERALL,
	type: AssignmentType.TESTAT,
	requiredPercent: 50
};

export const RULE_INDIVIDUAL_TESTAT_30_PERCENT: Rule = {
	scope: RuleScope.INDIVIDUAL,
	type: AssignmentType.TESTAT,
	requiredPercent: 30
};

export const ADMISSION_CRITERIA_JAVA: AdmissionCriteriaDto = {
	criteria: [
		RULE_OVERALL_HOMEWORK_50_PERCENT,
		RULE_INDIVIDUAL_HOMEWORK_30_PERCENT,
		RULE_OVERALL_TESTAT_50_PERCENT,
		RULE_INDIVIDUAL_TESTAT_30_PERCENT
	]
};

export const ADMISSION_CRITERIA_MOCK: AdmissionCriteriaDto[] = [
	ADMISSION_CRITERIA_JAVA
];
