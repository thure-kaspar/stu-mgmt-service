import { AssessmentDto } from "../../../course/dto/assessment/assessment.dto";
import { AssignmentDto } from "../../../course/dto/assignment/assignment.dto";
import { ParticipantDto } from "../../../course/dto/course-participant/participant.dto";
import { RoundingMethod, Percent } from "../../../utils/math";
import { OverallPercentRule, RuleCheckResult } from "../abstract-rules";

export class OverallPercentRuleImpl extends OverallPercentRule {

	private overallPoints: number;
	private round: (value: number) => number;

	constructor(rule: Partial<OverallPercentRule>, assignments: AssignmentDto[]) {
		super();
		Object.assign(this, rule);

		const relevantAssignments = assignments.filter(a => a.type === this.assignmentType);
		this.overallPoints = this.calculateOverallPoints(relevantAssignments);
		this.round = RoundingMethod(this.pointsRounding.type, this.pointsRounding.decimals);
	}

	check(assessments: AssessmentDto[], participant: ParticipantDto): RuleCheckResult {
		if (this.shouldBeIgnoredForParticipant(participant)) {
			return this.ignoreForParticipant();
		}

		// Rule is fulfilled, if there were no achievable points
		if (this.overallPoints === 0) {
			return {
				achievedPoints: 0,
				achievedPercent: 100,
				passed: true,
				comment: "No achievable points."
			};
		}

		const relevantAssessments = assessments.filter(a => a.assignment.type === this.assignmentType);
		const achievedPoints = this.calculateAchievedPoints(relevantAssessments);
		const currentPercent = this.round(Percent(achievedPoints, this.overallPoints));

		return {
			achievedPoints,
			achievedPercent: currentPercent,
			passed: currentPercent >= this.requiredPercent
		};
	}

	private calculateOverallPoints(assignments: AssignmentDto[]): number {
		let overall = 0;
		assignments.forEach(a => overall += a.points);
		return overall;
	}

	private calculateAchievedPoints(assessments: AssessmentDto[]): number {
		let achieved = 0;
		assessments.forEach(a => achieved += a.achievedPoints);
		return achieved;
	}

}
