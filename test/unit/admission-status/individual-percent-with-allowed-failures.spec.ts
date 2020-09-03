
import { AssessmentDto } from "../../../src/course/dto/assessment/assessment.dto";
import { AssignmentDto } from "../../../src/course/dto/assignment/assignment.dto";
import { AssignmentState, AssignmentType } from "../../../src/shared/enums";
import { RoundingType } from "../../../src/utils/math";
import { IndividualPercentWithAllowedFailures, RuleType } from "../../../src/admission-status/rules/abstract-rules";
import { IndividualPercentWithAllowedFailuresImpl } from "../../../src/admission-status/rules/impl/individual-percent-with-allowed-failures";
import { copy } from "../../utils/object-helper";

describe("PassedXPercentWithAtLeastYPercentImpl", () => {

	let assessments: AssessmentDto[];
	let assignments: AssignmentDto[];
	let rule: Partial<IndividualPercentWithAllowedFailures>;

	const assignmentType = AssignmentType.HOMEWORK;

	beforeEach(() => {
		rule = {
			type: RuleType.INDIVIDUAL_PERCENT_WITH_ALLOWED_FAILURES,
			assignmentType: assignmentType,
			requiredPercent: 50,
			achievedPercentRounding: {
				type: RoundingType.NONE
			},
			allowedFailures: 2
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

	it("3/4 Assignments passed (One missing assessment) -> Passed", () => {
		const _assessments = copy(assessments);
		_assessments.forEach(a => a.achievedPoints = a.assignment.points);

		const ruleImpl = new IndividualPercentWithAllowedFailuresImpl(rule, assignments);
		const result = ruleImpl.check(_assessments);
		expect(result._assignmentType).toEqual(assignmentType);
		expect(result._rule).toEqual(RuleType.INDIVIDUAL_PERCENT_WITH_ALLOWED_FAILURES);
		expect(result.passed).toEqual(true);
		expect(result.achievedPoints).toEqual(1); // Number of failed assignments
		expect(result.achievedPercent).toEqual(50);
	});

	it("2/4 Assignments passed -> Passed", () => {
		const ruleImpl = new IndividualPercentWithAllowedFailuresImpl(rule, assignments);
		const result = ruleImpl.check(assessments);
		expect(result._assignmentType).toEqual(assignmentType);
		expect(result._rule).toEqual(RuleType.INDIVIDUAL_PERCENT_WITH_ALLOWED_FAILURES);
		expect(result.passed).toEqual(true);
		expect(result.achievedPoints).toEqual(2); // Number of failed assignments
		expect(result.achievedPercent).toEqual(100); // Student had to pass exactly 2 assignments
	});

	it("0 Assignments given -> Passed", () => {
		const ruleImpl = new IndividualPercentWithAllowedFailuresImpl(rule, []);
		const result = ruleImpl.check(assessments);
		expect(result.passed).toEqual(true);
	});

	it("1/4 Assignments passed -> Not passed", () => {
		const _assessments = copy(assessments);
		_assessments.forEach(a => a.achievedPoints = 0); // Failed all
		_assessments[0].achievedPoints = _assessments[0].assignment.points; // Except for first one

		const ruleImpl = new IndividualPercentWithAllowedFailuresImpl(rule, assignments);
		const result = ruleImpl.check(_assessments);
		expect(result._assignmentType).toEqual(assignmentType);
		expect(result._rule).toEqual(RuleType.INDIVIDUAL_PERCENT_WITH_ALLOWED_FAILURES);
		expect(result.passed).toEqual(false);
		expect(result.achievedPoints).toEqual(3); // Number of failed assignments
		expect(result.achievedPercent).toEqual(3 / rule.allowedFailures * 100); // (3/2) * 100
	});

	it("0 Assessment given -> Not passed", () => {
		const ruleImpl = new IndividualPercentWithAllowedFailuresImpl(rule, assignments);
		const result = ruleImpl.check([]);
		expect(result.passed).toEqual(false);
	});

});
