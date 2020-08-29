import { RuleType } from "../rules/abstract-rules";
import { AssignmentType } from "../../shared/enums";

export abstract class RuleCheckResult {
	passed: boolean;
	achievedPoints: number;
	achievedPercent: number;
	comment?: string;
	_rule: RuleType;
	_assignmentType: AssignmentType;
}
