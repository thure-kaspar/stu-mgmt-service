import { IndividualPercentRule, RuleType } from "../../../src/admission-status/rules/abstract-rules";
import { ParticipantDto } from "../../../src/course/dto/course-participant/participant.dto";
import { AssessmentDto } from "../../../src/course/dto/assessment/assessment.dto";
import { AssignmentDto } from "../../../src/course/dto/assignment/assignment.dto";
import { PARTICIPANT_JAVA_1920_STUDENT } from "../../mocks/participants/participants.mock";
import { copy } from "../../utils/object-helper";
import { ASSIGNMENT_JAVA_EVALUATED } from "../../mocks/assignments.mock";
import { AssignmentState, AssignmentType } from "../../../src/shared/enums";
import { RoundingType } from "../../../src/utils/math";
import { IndividualPercentRuleImpl } from "../../../src/admission-status/rules/impl/individual-percent";

describe("INDIVIDUAL_PERCENT", () => {

	let participant: ParticipantDto;
	let assessments: AssessmentDto[];
	let assignments: AssignmentDto[];
	let rule: Partial<IndividualPercentRule>;

	const defaultAchievedPoints = 25;
	const defaultAchievablePoints = 50;
	const requiredPercentage = 50;

	beforeEach(() => {
		participant = PARTICIPANT_JAVA_1920_STUDENT.participant;
		const assignment = copy(ASSIGNMENT_JAVA_EVALUATED);

		assignment.state = AssignmentState.EVALUATED;
		assignment.type = AssignmentType.HOMEWORK;
		assignment.points = defaultAchievablePoints;

		// Assignment that should be ignored because it's not of type HOMEWORK
		const assignment_ignoredType = copy(ASSIGNMENT_JAVA_EVALUATED);
		assignment_ignoredType.state = AssignmentState.EVALUATED;
		assignment_ignoredType.points = 333;
		assignment_ignoredType.type = AssignmentType.PROJECT;

		assignments = [
			copy(assignment),
			copy(assignment_ignoredType),
			copy(assignment),
			copy(assignment_ignoredType),
			copy(assignment), 
			copy(assignment) 
		];

		assignments.forEach(a => a.id = Math.floor(Math.random() * 999999).toString());

		const achievedPointsArray: Partial<AssessmentDto>[] = assignments.map(a => ({
			achievedPoints: defaultAchievedPoints,
			assignment: a,
			assignmentId: a.id
		}));

		assessments = achievedPointsArray as any; // Only use required properties

		rule = {
			type: RuleType.INDIVIDUAL_PERCENT,
			assignmentType: AssignmentType.HOMEWORK,
			requiredPercent: requiredPercentage,
			pointsRounding: {
				type: RoundingType.NONE
			}
		};
	});

	describe("No rounding", () => {
	
		it("Exceeding required points for every assignment -> All passed", () => {
			const ruleImpl = new IndividualPercentRuleImpl(rule, assignments);
			const result = ruleImpl.check(assessments, participant);

			(result.achievedPoints as Array<number>).forEach(points => {
				expect(points).toEqual(defaultAchievedPoints);
			});

			(result.achievedPercent as Array<number>).forEach(percent => {
				expect(percent).toEqual((defaultAchievedPoints / requiredPercentage) * 100);
			});

			(result.passed as Array<boolean>).forEach(passed => {
				expect(passed).toEqual(true);
			});
		});

		it("Not enough points for one assignment -> One fail", () => {
			const firstAssignmentId = assignments[0].id;
			const assessmentToManipulate = assessments.findIndex(a => a.assignmentId === firstAssignmentId);

			const achievedPoints = 10;
			assessments[assessmentToManipulate].achievedPoints = achievedPoints;

			const ruleImpl = new IndividualPercentRuleImpl(rule, assignments);
			const result = ruleImpl.check(assessments, participant);

			// Rule not fulfilled for first assignment
			expect(result.achievedPoints[assessmentToManipulate]).toEqual(achievedPoints);
			expect(result.achievedPercent[assessmentToManipulate]).toEqual((achievedPoints / defaultAchievablePoints) * 100);
			expect(result.passed[assessmentToManipulate]).toEqual(false);

			// Rule fulfilled for all assignments except the first one
			(result.achievedPoints as Array<number>).forEach((points, index) => {
				if (index > 0)
					expect(points).toEqual(defaultAchievedPoints);
			});

			(result.achievedPercent as Array<number>).forEach((percent, index) => {
				if (index > 0)
					expect(percent).toEqual((defaultAchievedPoints / defaultAchievablePoints) * 100);
			});

			(result.passed as Array<boolean>).forEach((passed, index) => {
				if (index > 0)
					expect(passed).toEqual(true);
			});

		});
		
		it("Not enough points (every assignment) -> All failed", () => {
			const achievedPoints = 10;
			assessments.forEach(a => a.achievedPoints = achievedPoints);

			const ruleImpl = new IndividualPercentRuleImpl(rule, assignments);
			const result = ruleImpl.check(assessments, participant);

			(result.achievedPoints as Array<number>).forEach(points => {
				expect(points).toEqual(achievedPoints);
			});

			(result.achievedPercent as Array<number>).forEach(percent => {
				expect(percent).toEqual((achievedPoints / defaultAchievablePoints) * 100);
			});

			(result.passed as Array<boolean>).forEach(passed => {
				expect(passed).toEqual(false);
			});
		});

	});

	describe("Round to nearest integer", () => {

		beforeEach(() => {
			rule = {...rule, pointsRounding: {
				type: RoundingType.DECIMALS,
				decimals: 0
			}};
		});
	
		it("Rounds down -> All failed", () => {
			const achievedPoints = 24.749;
			assessments.forEach(a => a.achievedPoints = achievedPoints);

			const ruleImpl = new IndividualPercentRuleImpl(rule, assignments);
			const result = ruleImpl.check(assessments, participant);

			(result.achievedPoints as Array<number>).forEach(points => {
				expect(points).toEqual(achievedPoints);
			});

			(result.achievedPercent as Array<number>).forEach(percent => {
				expect(percent).toEqual(49);
			});

			(result.passed as Array<boolean>).forEach(passed => {
				expect(passed).toEqual(false);
			});
		});

		it("Rounds up -> All passed", () => {
			const achievedPoints = 24.7501;
			assessments.forEach(a => a.achievedPoints = achievedPoints);

			const ruleImpl = new IndividualPercentRuleImpl(rule, assignments);
			const result = ruleImpl.check(assessments, participant);

			(result.achievedPoints as Array<number>).forEach(points => {
				expect(points).toEqual(achievedPoints);
			});

			(result.achievedPercent as Array<number>).forEach(percent => {
				expect(percent).toEqual(50);
			});

			(result.passed as Array<boolean>).forEach(passed => {
				expect(passed).toEqual(true);
			});
		});
	
	});

});
