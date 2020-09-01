import { OverallPercentRule, RuleType } from "../../../src/admission-status/rules/abstract-rules";
import { OverallPercentRuleImpl } from "../../../src/admission-status/rules/impl/overall-percent";
import { AssessmentDto } from "../../../src/course/dto/assessment/assessment.dto";
import { AssignmentDto } from "../../../src/course/dto/assignment/assignment.dto";
import { AssignmentState, AssignmentType } from "../../../src/shared/enums";
import { RoundingType } from "../../../src/utils/math";
import { ASSIGNMENT_JAVA_EVALUATED } from "../../mocks/assignments.mock";
import { copy } from "../../utils/object-helper";

describe("OVERALL_PERCENT", () => {

	let assessments: AssessmentDto[];
	let assignments: AssignmentDto[];
	let rule: Partial<OverallPercentRule>;

	beforeEach(() => {
		const assignment = copy(ASSIGNMENT_JAVA_EVALUATED);

		assignment.state = AssignmentState.EVALUATED;
		assignment.type = AssignmentType.HOMEWORK;
		assignment.points = 25;

		// Assignment that should be ignored because it's not of type HOMEWORK
		const assignment_ignoredType = copy(ASSIGNMENT_JAVA_EVALUATED);
		assignment_ignoredType.state = AssignmentState.EVALUATED;
		assignment_ignoredType.points = 100;
		assignment_ignoredType.type = AssignmentType.PROJECT;

		// Overall points = 100
		assignments = [
			assignment, 				// +25
			assignment_ignoredType, 	// +0 (ignored)
			assignment, 				// +25
			assignment_ignoredType, 	// +0 (ignored)
			assignment, 				// +25
			assignment 					// +25
		];

		const achievedPointsArray: Partial<AssessmentDto>[] = assignments.map(a => ({
			achievedPoints: 20,
			assignment: a,
			assignmentId: a.id
		}));

		assessments = achievedPointsArray as any; // Only use required properties

		rule = {
			type: RuleType.REQUIRED_PERCENT_OVERALL,
			assignmentType: AssignmentType.HOMEWORK,
			requiredPercent: 50,
			achievedPercentRounding: {
				type: RoundingType.NONE
			}
		};
	});

	describe("No rounding", () => {
	
		it("Exceeding required points -> Passed", () => {
			const ruleImpl = new OverallPercentRuleImpl(rule, assignments);
			const result = ruleImpl.check(assessments);

			expect(result.achievedPoints).toEqual(80);
			expect(result.achievedPercent).toEqual(80);
			expect(result.passed).toEqual(true);
		});

		it("Exactly at required points -> Passed", () => {
			const achievedTotal = 50;
			const achievedPerAssignment = achievedTotal / 4;
			assessments.forEach(a => a.achievedPoints = achievedPerAssignment);

			const ruleImpl = new OverallPercentRuleImpl(rule, assignments);
			const result = ruleImpl.check(assessments);

			expect(result.achievedPoints).toEqual(achievedTotal);
			expect(result.achievedPercent).toEqual(achievedTotal);
			expect(result.passed).toEqual(true);
		});

		it("Not enough points -> Not passed", () => {
			const achievedTotal = 49.999;
			const achievedPerAssignment = achievedTotal / 4;
			assessments.forEach(a => a.achievedPoints = achievedPerAssignment);

			const ruleImpl = new OverallPercentRuleImpl(rule, assignments);
			const result = ruleImpl.check(assessments);

			expect(result.achievedPoints).toEqual(achievedTotal);
			expect(result.achievedPercent).toEqual(achievedTotal);
			expect(result.passed).toEqual(false);
		});
	
	});

	describe("Round to nearest integer", () => {
	
		it("First decimal <= 4 -> Rounds down -> Not passed", () => {
			const achievedTotal = 49.499;
			const achievedPerAssignment = achievedTotal / 4;
			assessments.forEach(a => a.achievedPoints = achievedPerAssignment);

			rule = {...rule, achievedPercentRounding: {
				type: RoundingType.DECIMALS,
				decimals: 0	
			}};

			const ruleImpl = new OverallPercentRuleImpl(rule, assignments);
			const result = ruleImpl.check(assessments);

			expect(result.achievedPoints).toEqual(achievedTotal);
			expect(result.achievedPercent).toEqual(49);
			expect(result.passed).toEqual(false);
		});

		it("First decimal >= 5 -> Rounds up -> Passed", () => {
			const achievedTotal = 49.50123;
			const achievedPerAssignment = achievedTotal / 4;
			assessments.forEach(a => a.achievedPoints = achievedPerAssignment);

			rule = {...rule, achievedPercentRounding: {
				type: RoundingType.DECIMALS,
				decimals: 0	
			}};

			const ruleImpl = new OverallPercentRuleImpl(rule, assignments);
			const result = ruleImpl.check(assessments);

			expect(result.achievedPoints).toEqual(achievedTotal);
			expect(result.achievedPercent).toEqual(50);
			expect(result.passed).toEqual(true);
		});
	
	});

	describe("Ignored", () => {

		it("No achievable points -> Passed", () => {
			assignments.forEach(a => a.points = 0); // All assignments awards 0 points

			const ruleImpl = new OverallPercentRuleImpl(rule, assignments);
			const result = ruleImpl.check(assessments);

			expect(result.achievedPoints).toEqual(0);
			expect(result.achievedPercent).toEqual(100);
			expect(result.passed).toEqual(true);
			expect(result.comment).toEqual("No achievable points.");
		});
	
	});

});
