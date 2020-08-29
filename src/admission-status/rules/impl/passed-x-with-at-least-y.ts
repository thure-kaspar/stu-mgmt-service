import { PassedXPercentWithAtLeastYPercent } from "../abstract-rules";
import { AssignmentDto } from "../../../course/dto/assignment/assignment.dto";
import { RoundingMethod, ofPercent, Percent } from "../../../utils/math";
import { AssignmentId } from "../../../course/entities/assignment.entity";
import { AssessmentDto } from "../../../course/dto/assessment/assessment.dto";
import { RuleCheckResult } from "../../dto/rule-check-result.dto";

export class PassedXPercentWithAtLeastYPercentImpl extends PassedXPercentWithAtLeastYPercent {

	private countOfAssignmentsThatStudentMustPass: number;
	private roundRequiredAssignments: (value: number) => number;
	private roundRequiredPoints: (value: number) => number;

	/** [AssignmentId, Rounded points required to pass] */
	private requiredPointsToPass = new Map<AssignmentId, number>();

	constructor(rule: Partial<PassedXPercentWithAtLeastYPercent>, assignments: AssignmentDto[]) {
		super();
		Object.assign(this, rule);
		
		this.roundRequiredPoints = RoundingMethod(this.pointsRounding.type, this.pointsRounding.decimals);
		this.roundRequiredAssignments = RoundingMethod(this.passedAssignmentsRounding.type, this.passedAssignmentsRounding.decimals);
		
		const relevantAssignments = this.filterAssignmentsByType(assignments);
		const requiredAssignmentCount = ofPercent(relevantAssignments.length, this.passedAssignmentsPercent);
		
		this.countOfAssignmentsThatStudentMustPass = this.roundRequiredAssignments(requiredAssignmentCount);

		relevantAssignments.forEach(assignment => {
			const pointsRequiredToPass = ofPercent(assignment.points, this.requiredPercent);
			this.requiredPointsToPass.set(assignment.id, this.roundRequiredPoints(pointsRequiredToPass));
		});
	}

	/**
	 * Checks each assessment of a student to determine, wether he passed it or not (by achieving the required percentage)
	 * The rule is passed, if the student passed the required amount of assignments or more.
	 */
	check(assessments: AssessmentDto[]): RuleCheckResult {
		const relevantAssessments = this.filterAssessmentsByType(assessments);
		const achievedPoints = this.mapAchievedPointsToAssignment(relevantAssessments);
		const passedAssignments = this.countPassedAssignments(achievedPoints);

		return {
			achievedPoints: passedAssignments,
			achievedPercent: Percent(passedAssignments, this.countOfAssignmentsThatStudentMustPass),
			passed: passedAssignments >= this.countOfAssignmentsThatStudentMustPass,
			_rule: this.type,
			_assignmentType: this.assignmentType
		};
	}

	/**
	 * Returns the count of passed assignments.
	 * @param achievedPoints Map of [assignmentId, achievedPoints]
	 */
	private countPassedAssignments(achievedPoints: { [assignmentId: string]: number; }[]) {
		let passedAssignments = 0;
		this.requiredPointsToPass.forEach((requiredPoints, assignmentId) => {
			if (this.studentPassedAssignment(achievedPoints, assignmentId, requiredPoints)) {
				passedAssignments++;
			}
		});
		return passedAssignments;
	}

	/**
	 * Determines, wether the student has achieved enough points to pass the assignment.
	 * @param achievedPoints Map of [assignmentId, achievedPoints]
	 * @param assignmentId Assignment that should be checked
	 * @param requiredPoints Points required in this assignment
	 */
	private studentPassedAssignment(achievedPoints: { [assignmentId: string]: number; }[], assignmentId: string, requiredPoints: number) {
		return achievedPoints[assignmentId] >= requiredPoints;
	}

	/**
	 *
	 *
	 * @private
	 * @param relevantAssessments
	 * @returns
	 */
	private mapAchievedPointsToAssignment(relevantAssessments: AssessmentDto[]): { [assignmentId: string]: number; }[] {
		return relevantAssessments.map(assessment => ({ [assessment.assignmentId]: assessment.achievedPoints }));
	}

} 

