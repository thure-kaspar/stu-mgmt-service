import { AssignmentDto } from "../../src/course/dto/assignment/assignment.dto";
import { AssignmentType, CollaborationType, AssignmentState } from "../../src/shared/enums";
import { COURSE_JAVA_1920, COURSE_JAVA_2020 } from "./courses.mock";

export const ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP: AssignmentDto = {
	id: "b2f6c008-b9f7-477f-9e8b-ff34ce339077",
	courseId: COURSE_JAVA_1920.id,
	name: "Test_Assignment 01 (Java)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.IN_PROGRESS,
	collaboration: CollaborationType.GROUP,
	startDate: new Date(2020, 8, 3),
	endDate: new Date(2020, 8, 10)
};

export const ASSIGNMENT_JAVA_CLOSED: AssignmentDto = {
	id: "74aa124c-0753-467f-8f52-48d1901282f8",
	courseId: COURSE_JAVA_1920.id,
	name: "Test_Assignment 02 (Java)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.CLOSED,
	collaboration: CollaborationType.GROUP,
	startDate: new Date(2020, 1, 9),
	endDate: new Date(2020, 1, 16)
};

export const ASSIGNMENT_JAVA_IN_REVIEW: AssignmentDto = {
	id: "993b3cd0-6207-11ea-bc55-0242ac130003",
	courseId: COURSE_JAVA_1920.id,
	name: "Test_Assignment 03 (Java)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.IN_REVIEW,
	collaboration: CollaborationType.SINGLE,
	startDate: new Date(2020, 5, 11),
	endDate: new Date(2020, 5, 18)
};

export const ASSIGNMENT_JAVA_EVALUATED: AssignmentDto = {
	id: "c2bc4aa4-6207-11ea-bc55-0242ac130003",
	courseId: COURSE_JAVA_1920.id,
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
	courseId: COURSE_JAVA_1920.id,
	name: "Test_Assignment 05 (Java) Invisible",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.INVISIBLE,
	collaboration: CollaborationType.GROUP_OR_SINGLE,
};

export const ASSIGNMENT_JAVA_TESTAT_IN_PROGRESS_SINGLE: AssignmentDto = {
	id: "5b69db81-edbd-4f73-8928-1450036a75cb",
	courseId: COURSE_JAVA_1920.id,
	name: "Test_Assignment 06 (Java) Testat In Progress",
	points: 100,
	type: AssignmentType.TESTAT,
	state: AssignmentState.IN_PROGRESS,
	collaboration: CollaborationType.SINGLE,
	startDate: new Date(2020, 7, 2),
};

export const ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE: AssignmentDto = {
	id: "75b799a1-a406-419b-a448-909aa3d34afa",
	courseId: COURSE_JAVA_1920.id,
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
	courseId: COURSE_JAVA_2020.id,
	name: "Assignment 01 (Group)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.IN_PROGRESS,
	collaboration: CollaborationType.GROUP,
	startDate: new Date(2020, 5, 27),
};

export const ASSIGNMENT_JAVA2020_SINGLE: AssignmentDto = {
	id: "8de9a9fd-591a-4801-a326-41b5f1c0aff5",
	courseId: COURSE_JAVA_2020.id,
	name: "Assignment 02 (Single)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.IN_PROGRESS,
	collaboration: CollaborationType.SINGLE,
	startDate: new Date(2020, 5, 27),
};

export const ASSIGNMENT_JAVA2020_SINGLE_2: AssignmentDto = {
	id: "3b70193f-ff6b-4183-abf9-ea0c9f96b0a2",
	courseId: COURSE_JAVA_2020.id,
	name: "Assignment 03 (Single)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.IN_PROGRESS,
	collaboration: CollaborationType.SINGLE,
	startDate: new Date(2020, 5, 27),
};

export const ASSIGNMENT_JAVA2020_GROUP_CLOSED: AssignmentDto = {
	id: "f288c766-1c8f-4d7f-9440-714786e3ee37",
	courseId: COURSE_JAVA_2020.id,
	name: "Assignment 04 (Group) (Closed)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.CLOSED,
	collaboration: CollaborationType.GROUP,
	startDate: new Date(2020, 5, 27),
};



export const AssignmentsMock: AssignmentDto[] = [
	ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP,
	ASSIGNMENT_JAVA_CLOSED,
	ASSIGNMENT_JAVA_IN_REVIEW,
	ASSIGNMENT_JAVA_EVALUATED,
	ASSIGNMENT_JAVA_INVISIBLE,
	ASSIGNMENT_JAVA_TESTAT_IN_PROGRESS_SINGLE,
	ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE,
	ASSIGNMENT_JAVA2020_GROUP,
	ASSIGNMENT_JAVA2020_SINGLE,
	ASSIGNMENT_JAVA2020_SINGLE_2,
	ASSIGNMENT_JAVA2020_GROUP_CLOSED
];
