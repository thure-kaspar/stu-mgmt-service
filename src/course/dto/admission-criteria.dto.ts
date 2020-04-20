import { AssignmentType } from "../../shared/enums";
import { Min, Max } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AdmissionCriteriaDto {
	/** Rules that must be fulfilled in order to be admitted. */
	@ApiProperty({ description: "Rules that must be fulfilled in order to be admitted." })
	criteria: Rule[];

	/** Rules that must be fulfilled in order to be admitted. */
	@ApiPropertyOptional({ description: "Assignments that should be excluded from the rules."})
	exludedAssigmentIds?: string[]
}

export class Rule {
	/** Determines, wether the rule should be evaluated for every assignment or the summarized points. */
	@ApiProperty({ description: "Determines, wether the rule should be evaluated for every assignment or the summarized points."})
	scope: RuleScope;

	/** The assignment type that the rule applies to. */
	@ApiProperty({ description: "The assignment type that the rule applies to."})
	type: AssignmentType;

	/** The required percentage to fulfill the rule. */
	@ApiProperty({ description: "The required percentage to fulfill the rule."})
	@Min(0)
	@Max(100)
	requiredPercent: number;
}

export enum RuleScope {
	OVERALL = "OVERALL",
	INDIVIDUAL = "INDIVIDUAL"
}
