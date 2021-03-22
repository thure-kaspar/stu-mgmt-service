import { AssessmentDto } from "../../../course/dto/assessment/assessment.dto";
import { AssignmentDto } from "../../../course/dto/assignment/assignment.dto";
import { Percent, RoundingMethod, sumOf } from "../../../utils/math";
import { OverallPercentRule } from "../abstract-rules";
import { RuleCheckResult } from "../../dto/rule-check-result.dto";

export class OverallPercentRuleImpl extends OverallPercentRule {
	private overallPoints: number;
	private round: (value: number) => number;

	constructor(rule: Partial<OverallPercentRule>, assignments: AssignmentDto[]) {
		super();
		Object.assign(this, rule);

		const relevantAssignments = this.filterAssignmentsByType(assignments);
		this.overallPoints = sumOf(relevantAssignments, a => a.points);
		this.round = RoundingMethod(
			this.achievedPercentRounding.type,
			this.achievedPercentRounding.decimals
		);
	}

	/**
	 * Sums up the achieved points of a student and checks, wether the percentage of
	 * achieved points is equal or greater than the required percentage of achievable points.
	 */
	check(assessments: AssessmentDto[]): RuleCheckResult {
		// Rule is fulfilled, if there were no achievable points
		if (this.overallPoints === 0) {
			return {
				achievedPoints: 0,
				achievedPercent: 100,
				passed: true,
				comment: "No achievable points.",
				_rule: this.type,
				_assignmentType: this.assignmentType
			};
		}

		const relevantAssessments = this.filterAssessmentsByType(assessments);
		const achievedPoints = sumOf(relevantAssessments, a => a.achievedPoints ?? 0);
		const achievedPercent = this.round(Percent(achievedPoints, this.overallPoints));

		return {
			achievedPoints,
			achievedPercent,
			passed: achievedPercent >= this.requiredPercent,
			_rule: this.type,
			_assignmentType: this.assignmentType
		};
	}
}
