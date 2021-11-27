import { AssignmentDto } from "../../src/course/dto/assignment/assignment.dto";
import { AssignmentType, CollaborationType, AssignmentState } from "../../src/shared/enums";
import { COURSE_JAVA_1920, COURSE_JAVA_2020, COURSE_INFO_2_2020 } from "./courses.mock";
import { CourseId } from "../../src/course/entities/course.entity";

export const ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP: AssignmentDto = {
	id: "b2f6c008-b9f7-477f-9e8b-ff34ce339077",
	name: "Test_Assignment 01 (Java)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.IN_PROGRESS,
	collaboration: CollaborationType.GROUP,
	startDate: new Date(2020, 8, 3),
	comment:
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione ab, quaerat minus corrupti quia nostrum facere quibusdam, repellendus, reprehenderit officiis rerum nemo modi perspiciatis ex obcaecati consectetur nisi voluptatum veritatis.",
	links: [
		{
			name: "Example URL",
			url: "https://example-url.com"
		}
	],
	configs: [
		{
			tool: "tool-1",
			config: "{hello: 'world'}"
		},
		{
			tool: "tool-2",
			config: "{lorem: 'ipsum'}"
		}
	]
};

export const ASSIGNMENT_JAVA_CLOSED: AssignmentDto = {
	id: "74aa124c-0753-467f-8f52-48d1901282f8",
	name: "Test_Assignment 02 (Java)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.CLOSED,
	collaboration: CollaborationType.GROUP,
	startDate: new Date(2020, 1, 9),
	endDate: new Date(2020, 1, 16)
};

export const ASSIGNMENT_JAVA_IN_REVIEW_SINGLE: AssignmentDto = {
	id: "993b3cd0-6207-11ea-bc55-0242ac130003",
	name: "Test_Assignment 03 (Java) - SINGLE - IN_REVIEW",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.IN_REVIEW,
	collaboration: CollaborationType.SINGLE,
	startDate: new Date(2020, 5, 11),
	endDate: new Date(2020, 5, 18)
};

export const ASSIGNMENT_JAVA_IN_REVIEW_GROUP: AssignmentDto = {
	id: "f50b8474-1fb9-4d69-85a2-76648d0fd3f9",
	name: "Test_Assignment 08 (Java) - GROUP - IN_REVIEW",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.IN_REVIEW,
	collaboration: CollaborationType.GROUP,
	startDate: new Date(2020, 7, 21),
	endDate: new Date(2020, 7, 22)
};

export const ASSIGNMENT_JAVA_EVALUATED: AssignmentDto = {
	id: "c2bc4aa4-6207-11ea-bc55-0242ac130003",
	name: "Test_Assignment 04 (Java)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.EVALUATED,
	collaboration: CollaborationType.GROUP_OR_SINGLE,
	startDate: new Date(2020, 4, 4),
	endDate: new Date(2020, 4, 11)
};

export const ASSIGNMENT_JAVA_INVISIBLE: AssignmentDto = {
	id: "8ffc9608-4c3d-4fca-b4fc-3768822d6c0d",
	name: "Test_Assignment 05 (Java) Invisible",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.INVISIBLE,
	collaboration: CollaborationType.GROUP_OR_SINGLE
};

export const ASSIGNMENT_JAVA_TESTAT_IN_PROGRESS_SINGLE: AssignmentDto = {
	id: "5b69db81-edbd-4f73-8928-1450036a75cb",
	name: "Test_Assignment 06 (Java) Testat In Progress",
	points: 100,
	type: AssignmentType.TESTAT,
	state: AssignmentState.IN_PROGRESS,
	collaboration: CollaborationType.SINGLE,
	startDate: new Date(2020, 7, 2)
};

export const ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE: AssignmentDto = {
	id: "75b799a1-a406-419b-a448-909aa3d34afa",
	name: "Test_Assignment 07 (Java) Testat Evaluated",
	points: 100,
	type: AssignmentType.TESTAT,
	state: AssignmentState.EVALUATED,
	collaboration: CollaborationType.SINGLE,
	startDate: new Date(2020, 3, 20),
	endDate: new Date(2020, 3, 27)
};

export const ASSIGNMENT_JAVA2020_GROUP: AssignmentDto = {
	id: "962390b6-de9a-493a-8db1-5f1787576e51",
	name: "Assignment 01 (Group)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.IN_PROGRESS,
	collaboration: CollaborationType.GROUP,
	startDate: new Date(2020, 5, 27)
};

export const ASSIGNMENT_JAVA2020_SINGLE: AssignmentDto = {
	id: "8de9a9fd-591a-4801-a326-41b5f1c0aff5",
	name: "Assignment 02 (Single)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.IN_PROGRESS,
	collaboration: CollaborationType.SINGLE,
	startDate: new Date(2020, 5, 27)
};

export const ASSIGNMENT_JAVA2020_SINGLE_2: AssignmentDto = {
	id: "3b70193f-ff6b-4183-abf9-ea0c9f96b0a2",
	name: "Assignment 03 (Single)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.IN_PROGRESS,
	collaboration: CollaborationType.SINGLE,
	startDate: new Date(2020, 5, 27)
};

export const ASSIGNMENT_JAVA2020_GROUP_CLOSED: AssignmentDto = {
	id: "f288c766-1c8f-4d7f-9440-714786e3ee37",
	name: "Assignment 04 (Group) (Closed)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.CLOSED,
	collaboration: CollaborationType.GROUP,
	startDate: new Date(2020, 5, 27)
};

export const ASSIGNMENT_INVISIBLE_WILL_BE_STARTED: AssignmentDto = {
	id: "ec328bb0-cd98-4ee0-a6e8-308c8c4a694d",
	name: "ASSIGNMENT_JAVA_INVISIBLE_WILL_BE_STARTED",
	points: 0,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.INVISIBLE,
	startDate: new Date(),
	collaboration: CollaborationType.GROUP_OR_SINGLE
};

export const ASSIGNMENT_INVISIBLE_NEXT_TO_START: AssignmentDto = {
	id: "cb46a4d6-4741-4778-a4c1-87007582c016",
	name: "ASSIGNMENT_INVISIBLE_NEXT_TO_START",
	points: 0,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.INVISIBLE,
	startDate: createDateWithOffset(new Date(), 1),
	endDate: createDateWithOffset(new Date(), 2),
	collaboration: CollaborationType.GROUP_OR_SINGLE
};

export const ASSIGNMENT_INVISIBLE_SECOND_TO_START: AssignmentDto = {
	id: "bbb63fed-5dc6-400d-ac1f-a99708cd1700",
	name: "ASSIGNMENT_INVISIBLE_SECOND_TO_START",
	points: 0,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.INVISIBLE,
	startDate: createDateWithOffset(new Date(), 2),
	endDate: createDateWithOffset(new Date(), 3),
	collaboration: CollaborationType.SINGLE
};

export const ASSIGNMENT_IN_PROGRESS_WILL_BE_STOPPED: AssignmentDto = {
	id: "d0b208a1-7374-4c8b-a01e-f685324a73c7",
	name: "ASSIGNMENT_JAVA_IN_PROGRESS_WILL_BE_STOPPED",
	points: 0,
	type: AssignmentType.TESTAT,
	state: AssignmentState.IN_PROGRESS,
	collaboration: CollaborationType.SINGLE,
	startDate: new Date(2020, 7, 2),
	endDate: new Date()
};

export const ASSIGNMENTS_JAVA_1920: AssignmentDto[] = [
	ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP,
	ASSIGNMENT_JAVA_CLOSED,
	ASSIGNMENT_JAVA_IN_REVIEW_SINGLE,
	ASSIGNMENT_JAVA_EVALUATED,
	ASSIGNMENT_JAVA_INVISIBLE,
	ASSIGNMENT_JAVA_TESTAT_IN_PROGRESS_SINGLE,
	ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE,
	ASSIGNMENT_JAVA_IN_REVIEW_GROUP
];

export const ASSIGNMENTS_JAVA_2020: AssignmentDto[] = [
	ASSIGNMENT_JAVA2020_GROUP,
	ASSIGNMENT_JAVA2020_SINGLE,
	ASSIGNMENT_JAVA2020_SINGLE_2,
	ASSIGNMENT_JAVA2020_GROUP_CLOSED
];

export const ASSIGNMENTS_INFO_2020: AssignmentDto[] = [
	ASSIGNMENT_INVISIBLE_WILL_BE_STARTED,
	ASSIGNMENT_IN_PROGRESS_WILL_BE_STOPPED,
	ASSIGNMENT_INVISIBLE_NEXT_TO_START,
	ASSIGNMENT_INVISIBLE_SECOND_TO_START
];

export const ASSIGNMENTS_ALL: { assignments: AssignmentDto[]; courseId: CourseId }[] = [
	{ assignments: ASSIGNMENTS_JAVA_1920, courseId: COURSE_JAVA_1920.id },
	{ assignments: ASSIGNMENTS_JAVA_2020, courseId: COURSE_JAVA_2020.id },
	{ assignments: ASSIGNMENTS_INFO_2020, courseId: COURSE_INFO_2_2020.id }
];

function createDateWithOffset(today: Date, dayOffset: number): Date {
	return new Date(today.getTime() + 1000 * 60 * 60 * 24 * (dayOffset || 1));
}
