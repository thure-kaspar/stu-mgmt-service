import { Severity } from "../../src/assessment/dto/marker.dto";
import { PartialAssessmentDto } from "../../src/assessment/dto/partial-assessment.dto";
import {
	ASSESSMENT_JAVA_IN_REVIEW,
	ASSESSMENT_JAVA_IN_REVIEW_GROUP_PARTIALS
} from "./assessments.mock";

export const PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW: PartialAssessmentDto = {
	key: "task-1",
	title: "Task 1",
	draftOnly: false,
	comment: "Very good",
	points: 10
};

export const PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW: PartialAssessmentDto = {
	key: "task-2",
	title: "Task 2",
	draftOnly: false,
	comment: "Very bad",
	points: 0
};

export const PARTIAL_ASSESSMENT_3_JAVA_IN_REVIEW_DRAFT_ONLY: PartialAssessmentDto = {
	key: "draftOnly",
	title: "Draft Only",
	draftOnly: true,
	comment: "Should only be visible when the assessment has isDraft set to true."
};

export const PARTIAL_ASSESSMENT_JAVA_IN_REVIEW_GROUP_MARKERS: PartialAssessmentDto = {
	key: "with-markers",
	title: "Task 1",
	draftOnly: false,
	markers: [
		{
			path: "src/de/uni-hildesheim/hello.java",
			comment: "Missing ; at the end of line 5",
			startLineNumber: 5,
			endLineNumber: 5,
			startColumn: 30,
			endColumn: 30,
			severity: Severity.ERROR,
			points: 0
		}
	]
};

export const PARTIAL_ASSESSMENT_MOCK: { assessmentId: string; dto: PartialAssessmentDto }[] = [
	{ assessmentId: ASSESSMENT_JAVA_IN_REVIEW.id, dto: PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW },
	{ assessmentId: ASSESSMENT_JAVA_IN_REVIEW.id, dto: PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW },
	{
		assessmentId: ASSESSMENT_JAVA_IN_REVIEW_GROUP_PARTIALS.id,
		dto: PARTIAL_ASSESSMENT_JAVA_IN_REVIEW_GROUP_MARKERS
	}
];
