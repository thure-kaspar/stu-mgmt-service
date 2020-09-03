import { AssessmentDto } from "../../../course/dto/assessment/assessment.dto";
import { AssignmentDto } from "../../../course/dto/assignment/assignment.dto";
import { AssignmentId } from "../../../course/entities/assignment.entity";
import { Percent, RoundingMethod } from "../../../utils/math";
import { RuleCheckResult } from "../../dto/rule-check-result.dto";
import { IndividualPercentWithAllowedFailures } from "../abstract-rules";

export class IndividualPercentWithAllowedFailuresImpl extends IndividualPercentWithAllowedFailures {

	private roundAchievedPercent: (value: number) => number;

	/** [AssignmentId, Rounded points required to pass] */
	private requiredPointsToPass = new Map<AssignmentId, number>();

	constructor(rule: Partial<IndividualPercentWithAllowedFailures>, assignments: AssignmentDto[]) {
		super();
		Object.assign(this, rule);
		
		this.roundAchievedPercent = RoundingMethod(this.achievedPercentRounding.type, this.achievedPercentRounding.decimals);
		
		const relevantAssignments = this.filterAssignmentsByType(assignments);
		relevantAssignments.forEach(assignment => {
			this.requiredPointsToPass.set(assignment.id, assignment.points);
		});
	}

	/**
	 * Checks each assessment of a student to determine, wether he passed it or not (by achieving the required percentage)
	 * The rule is passed, if the student passed the required amount of assignments or more.
	 */
	check(assessments: AssessmentDto[]): RuleCheckResult {
		const relevantAssessments = this.filterAssessmentsByType(assessments);
		const achievedPoints = this.mapAchievedPointsToAssignment(relevantAssessments);
		const failedAssignments = this.countFailedAssignments(achievedPoints);

		const result: RuleCheckResult = {
			achievedPoints: failedAssignments,
			achievedPercent: Percent(failedAssignments, this.allowedFailures),
			passed: failedAssignments < this.allowedFailures,
			_rule: this.type,
			_assignmentType: this.assignmentType
		};
		return result;
	}

	/**
	 * Returns the count of failed assignments.
	 * @param achievedPoints Map of [assignmentId, achievedPoints]
	 */
	private countFailedAssignments(achievedPoints: Map<AssignmentId, number>) {
		let failures = 0;
		this.requiredPointsToPass.forEach((requiredPoints, assignmentId) => {
			if (this.studentFailedAssignment(achievedPoints, assignmentId)) {
				failures++;
			}
		});
		return failures;
	}

	/**
	 * Determines, wether the student has achieved enough points to pass the assignment.
	 * @param achievedPoints Map of [assignmentId, achievedPoints]
	 * @param assignmentId Assignment that should be checked
	 */
	private studentFailedAssignment(achievedPoints: Map<AssignmentId, number>, assignmentId: AssignmentId): boolean {
		const achievedPercent = Percent(achievedPoints.get(assignmentId), this.requiredPointsToPass.get(assignmentId));
		const achievedPercentRounded = this.roundAchievedPercent(achievedPercent);
		return achievedPercentRounded < this.requiredPercent;
	}

	/**
	 * Creates an [AssignmentId, achieved points]-Map.
	 */
	private mapAchievedPointsToAssignment(relevantAssessments: AssessmentDto[]): Map<string, number> {
		const map = new Map<AssignmentId, number>();
		relevantAssessments.forEach(assessment => {
			map.set(assessment.assignmentId, assessment.achievedPoints);
		});
		return map;
	}

} 

