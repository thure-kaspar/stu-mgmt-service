import { PassedXPercentWithAtLeastYPercent, RuleType } from "../../../src/admission-status/rules/abstract-rules";
import { AssessmentDto } from "../../../src/course/dto/assessment/assessment.dto";
import { AssignmentDto } from "../../../src/course/dto/assignment/assignment.dto";
import { AssignmentState, AssignmentType } from "../../../src/shared/enums";
import { RoundingType } from "../../../src/utils/math";
import { PassedXPercentWithAtLeastYPercentImpl } from "../../../src/admission-status/rules/impl/passed-x-with-at-least-y";

describe("PassedXPercentWithAtLeastYPercentImpl", () => {

	let assessments: AssessmentDto[];
	let assignments: AssignmentDto[];
	let rule: Partial<PassedXPercentWithAtLeastYPercent>;

	const assignmentType = AssignmentType.HOMEWORK;

	beforeEach(() => {
		rule = {
			type: RuleType.PASSED_X_PERCENT_WITH_AT_LEAST_Y_PERCENT,
			assignmentType: assignmentType,
			requiredPercent: 50,
			pointsRounding: {
				type: RoundingType.NONE
			},
			passedAssignmentsPercent: 70,
			passedAssignmentsRounding: {
				type: RoundingType.DOWN_NEAREST_INTEGER
			},
		};

		const assignment_1: Partial<AssignmentDto> = {
			id: "assignment_id_1",
			type: assignmentType,
			state: AssignmentState.EVALUATED,
			points: 50
		};

		const assignment_2: Partial<AssignmentDto> = {
			id: "assignment_id_2",
			type: assignmentType,
			state: AssignmentState.EVALUATED,
			points: 50
		};

		const assignment_3: Partial<AssignmentDto> = {
			id: "assignment_id_3",
			type: assignmentType,
			state: AssignmentState.EVALUATED,
			points: 100
		};

		const assignment_4_no_assessment: Partial<AssignmentDto> = {
			id: "assignment_id_4_no_assessment",
			type: assignmentType,
			state: AssignmentState.EVALUATED,
			points: 50
		};

		const assignment_ignored_wrong_type: Partial<AssignmentDto> = {
			id: "assignment_id_ignored_wrong_type",
			type: AssignmentType.TESTAT,
			state: AssignmentState.EVALUATED,
			points: 123
		};

		const assignment_ignored_not_evaluated: Partial<AssignmentDto> = {
			id: "assignment_ignored_not_evaluated",
			type: assignmentType,
			state: AssignmentState.IN_REVIEW,
			points: 456
		};

		assignments = [
			assignment_1,
			assignment_ignored_wrong_type,
			assignment_2,
			assignment_ignored_not_evaluated,
			assignment_3,
			assignment_4_no_assessment,
		] as any; // Cast to any, because we only defined necessary properties

		const _assessments: Partial<AssessmentDto>[] = assignments.map(assignment => ({
			assignmentId: assignment.id,
			assignment: assignment,
			achievedPoints: 40
		}));
		_assessments.pop(); // Simulate that no assessment exists for last assignment

		assessments = _assessments as any;
	});

	it("2 Assessment passed -> Passed", () => {
		const ruleImpl = new PassedXPercentWithAtLeastYPercentImpl(rule, assignments);
		const result = ruleImpl.check(assessments);
		expect(result._assignmentType).toEqual(assignmentType);
		expect(result._rule).toEqual(RuleType.PASSED_X_PERCENT_WITH_AT_LEAST_Y_PERCENT);
		expect(result.passed).toEqual(true);
		expect(result.achievedPoints).toEqual(2); // Number of passed assignments
		expect(result.achievedPercent).toEqual(100); // Student had to pass exactly 2 assignments
	});

	it("0 Assignments given -> Passed", () => {
		const ruleImpl = new PassedXPercentWithAtLeastYPercentImpl(rule, []);
		const result = ruleImpl.check(assessments);
		expect(result.passed).toEqual(true);
	});

	it("0 Assessment given -> Not passed", () => {
		const ruleImpl = new PassedXPercentWithAtLeastYPercentImpl(rule, assignments);
		const result = ruleImpl.check([]);
		expect(result.passed).toEqual(false);
	});

});
