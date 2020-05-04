import { PartialAssessmentDto } from "../../src/course/dto/assessment/partial-assessment.dto";
import { ASSESSMENT_JAVA_IN_REVIEW } from "./assessments.mock";

export const PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW: PartialAssessmentDto = {
	assessmentId: ASSESSMENT_JAVA_IN_REVIEW.id,
	comment: "Very good",
	points: 10,
	severity: "???",
	type: "???"
};

export const PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW: PartialAssessmentDto = {
	assessmentId: ASSESSMENT_JAVA_IN_REVIEW.id,
	comment: "Very bad",
	points: 0,
	severity: "???",
	type: "???"
};

export const PARTIAL_ASSESSMENT_MOCK: PartialAssessmentDto[] = [
	PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW,
	PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW
];
