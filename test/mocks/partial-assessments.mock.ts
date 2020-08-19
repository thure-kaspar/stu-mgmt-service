import { PartialAssessmentDto, Severity } from "../../src/course/dto/assessment/partial-assessment.dto";
import { ASSESSMENT_JAVA_IN_REVIEW, ASSESSMENT_JAVA_IN_REVIEW_GROUP_PARTIALS } from "./assessments.mock";

export const PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW: PartialAssessmentDto = {
	id: 1,
	assessmentId: ASSESSMENT_JAVA_IN_REVIEW.id,
	title: "Task 1",
	comment: "Very good",
	points: 10,
	severity: Severity.INFORMATIONAL,
	type: "???"
};

export const PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW: PartialAssessmentDto = {
	id: 2,
	assessmentId: ASSESSMENT_JAVA_IN_REVIEW.id,
	title: "Task 2",
	comment: "Very bad",
	points: 0,
	severity: Severity.CRITICAL,
	type: "???"
};

export const PARTIAL_ASSESSMENT_JAVA_IN_REVIEW_GROUP: PartialAssessmentDto = {
	id: 3,
	assessmentId: ASSESSMENT_JAVA_IN_REVIEW_GROUP_PARTIALS.id,
	title: "Task 1",
	comment: "Missing ; at the end of line 5",
	path: "src/de/uni-hildesheim/hello.java",
	line: 12,
	points: 0,
	severity: Severity.ERROR,
	type: "Compiler Error"
};

export const PARTIAL_ASSESSMENT_MOCK: PartialAssessmentDto[] = [
	PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW,
	PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW,
	PARTIAL_ASSESSMENT_JAVA_IN_REVIEW_GROUP
];
