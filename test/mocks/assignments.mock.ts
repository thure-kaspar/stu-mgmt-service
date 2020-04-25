import { AssignmentDto } from "../../src/shared/dto/assignment.dto";
import { AssignmentType, CollaborationType, AssignmentState } from "../../src/shared/enums";
import { COURSE_JAVA_1920 } from "./courses.mock";

export const ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP: AssignmentDto = {
	id: "b2f6c008-b9f7-477f-9e8b-ff34ce339077",
	courseId: COURSE_JAVA_1920.id,
	name: "Test_Assignment 01 (Java)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.IN_PROGRESS,
	collaborationType: CollaborationType.GROUP
};

export const ASSIGNMENT_JAVA_CLOSED: AssignmentDto = {
	id: "74aa124c-0753-467f-8f52-48d1901282f8",
	courseId: COURSE_JAVA_1920.id,
	name: "Test_Assignment 02 (Java)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.CLOSED,
	collaborationType: CollaborationType.GROUP
};

export const ASSIGNMENT_JAVA_IN_REVIEW: AssignmentDto = {
	id: "993b3cd0-6207-11ea-bc55-0242ac130003",
	courseId: COURSE_JAVA_1920.id,
	name: "Test_Assignment 03 (Java)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.IN_REVIEW,
	collaborationType: CollaborationType.SINGLE
};

export const ASSIGNMENT_JAVA_EVALUATED: AssignmentDto = {
	id: "c2bc4aa4-6207-11ea-bc55-0242ac130003",
	courseId: COURSE_JAVA_1920.id,
	name: "Test_Assignment 04 (Java)",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.EVALUATED,
	collaborationType: CollaborationType.GROUP_OR_SINGLE,
};

export const ASSIGNMENT_JAVA_INVISIBLE: AssignmentDto = {
	id: "8ffc9608-4c3d-4fca-b4fc-3768822d6c0d",
	courseId: COURSE_JAVA_1920.id,
	name: "Test_Assignment 05 (Java) Invisible",
	points: 100,
	type: AssignmentType.HOMEWORK,
	state: AssignmentState.INVISIBLE,
	collaborationType: CollaborationType.GROUP_OR_SINGLE,
};

export const ASSIGNMENT_JAVA_TESTAT_IN_PROGRESS_SINGLE: AssignmentDto = {
	id: "5b69db81-edbd-4f73-8928-1450036a75cb",
	courseId: COURSE_JAVA_1920.id,
	name: "Test_Assignment 06 (Java) Testat In Progress",
	points: 100,
	type: AssignmentType.TESTAT,
	state: AssignmentState.IN_PROGRESS,
	collaborationType: CollaborationType.SINGLE,
};

export const ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE: AssignmentDto = {
	id: "75b799a1-a406-419b-a448-909aa3d34afa",
	courseId: COURSE_JAVA_1920.id,
	name: "Test_Assignment 07 (Java) Testat Evaluated",
	points: 100,
	type: AssignmentType.TESTAT,
	state: AssignmentState.EVALUATED,
	collaborationType: CollaborationType.SINGLE,
};

export const AssignmentsMock: AssignmentDto[] = [
	ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP,
	ASSIGNMENT_JAVA_CLOSED,
	ASSIGNMENT_JAVA_IN_REVIEW,
	ASSIGNMENT_JAVA_EVALUATED,
	ASSIGNMENT_JAVA_INVISIBLE,
	ASSIGNMENT_JAVA_TESTAT_IN_PROGRESS_SINGLE,
	ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE
];
