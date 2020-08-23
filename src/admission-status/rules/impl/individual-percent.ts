import { IndividualPercentRule, RuleCheckResult } from "../abstract-rules";
import { AssignmentDto } from "../../../course/dto/assignment/assignment.dto";
import { AssessmentDto } from "../../../course/dto/assessment/assessment.dto";
import { ParticipantDto } from "../../../course/dto/course-participant/participant.dto";
import { RoundingMethod, Percent } from "../../../utils/math";

export class IndividualPercentRuleImpl extends IndividualPercentRule {
	
	private round: (value: number) => number;

	constructor(rule: Partial<IndividualPercentRule>, assignments: AssignmentDto[]) {
		super();
		Object.assign(this, rule);
		this.round = RoundingMethod(this.pointsRounding.type, this.pointsRounding.decimals);
		this.assignments = this.filterAssignmentsByType(assignments);
	} 

	check(assessments: AssessmentDto[], participant: ParticipantDto): RuleCheckResult {
		if (this.shouldBeIgnoredForParticipant(participant)) {
			return this.ignoreForParticipant();
		}

		const achievedPointsMap = new Map<string, number>();
		assessments.forEach(a => achievedPointsMap.set(a.assignmentId, a.achievedPoints));

		const result: RuleCheckResult = {
			achievedPoints: [],
			achievedPercent: [],
			passed: [],
		};

		this.assignments.forEach(assignment => {
			const achievedPoints = achievedPointsMap.get(assignment.id) ?? 0;

			// Rule fulfilled for the assignment, if it had no points
			if (assignment.points === 0) {
				(result.achievedPoints as Array<number>).push(achievedPoints);
				(result.achievedPercent as Array<number>).push(100);
				(result.passed as Array<boolean>).push(true);
			}

			const achievedPercent = this.round(Percent(achievedPoints, assignment.points));

			(result.achievedPoints as Array<number>).push(achievedPoints);
			(result.achievedPercent as Array<number>).push(achievedPercent);
			(result.passed as Array<boolean>).push(achievedPercent >= this.requiredPercent);
		});

		return result;
	}

}
