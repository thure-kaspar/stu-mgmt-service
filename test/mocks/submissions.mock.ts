import { SubmissionDto } from "../../src/submission/submission.dto";
import { ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP } from "./assignments.mock";
import { GROUP_1_JAVA } from "./groups/groups.mock";
import { USER_STUDENT_JAVA } from "./users.mock";

export const SUBMISSION_USER_1_ASSIGNMENT_IN_PROGRESS_HOMEWORK_GROUP_1: SubmissionDto = {
	assignmentId: ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP.id,
	userId: USER_STUDENT_JAVA.id,
	displayName: USER_STUDENT_JAVA.displayName,
	date: new Date(2020, 1, 2, 8, 42),
	groupId: GROUP_1_JAVA.id,
	groupName: GROUP_1_JAVA.name,
	links: [
		{
			name: "Link 1",
			url: "http://example.url"
		},
		{
			name: "Link 2",
			url: "http://example.url"
		}
	],
	payload: {
		error: "Something went wrong."
	}
};

export const SUBMISSION_USER_1_ASSIGNMENT_IN_PROGRESS_HOMEWORK_GROUP_2: SubmissionDto = {
	...SUBMISSION_USER_1_ASSIGNMENT_IN_PROGRESS_HOMEWORK_GROUP_1,
	date: new Date(2020, 1, 2, 9, 42),
	links: null,
	payload: null
};

export const SUBMISSION_MOCK: SubmissionDto[] = [
	SUBMISSION_USER_1_ASSIGNMENT_IN_PROGRESS_HOMEWORK_GROUP_1,
	SUBMISSION_USER_1_ASSIGNMENT_IN_PROGRESS_HOMEWORK_GROUP_2
];
