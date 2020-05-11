
import { UpdateMessage, EventType, AffectedObject } from "../../src/shared/dto/update-message.dto";
import { COURSE_JAVA_1920 } from "./courses.mock";
import { USER_STUDENT_JAVA } from "./users.mock";
import { GROUP_1_JAVA } from "./groups/groups.mock";
import { ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP } from "./assignments.mock";

//#region GROUP
export const MESSAGE_GROUP_INSERT: UpdateMessage = {
	type: EventType.INSERT,
	affectedObject: AffectedObject.GROUP,
	courseId: COURSE_JAVA_1920.id,
	entityId: GROUP_1_JAVA.id,
	date: new Date(2020, 3, 16, 10, 0, 0, 0)
};

// Not necessary ?
export const MESSAGE_GROUP_UPDATE: UpdateMessage = {
	type: EventType.UPDATE,
	affectedObject: AffectedObject.GROUP,
	courseId: COURSE_JAVA_1920.id,
	entityId: GROUP_1_JAVA.id,
	date: new Date(2020, 3, 16, 10, 5, 0, 0)
};

export const MESSAGE_GROUP_REMOVE: UpdateMessage = {
	type: EventType.REMOVE,
	affectedObject: AffectedObject.GROUP,
	courseId: COURSE_JAVA_1920.id,
	entityId: GROUP_1_JAVA.id,
	date: new Date(2020, 3, 16, 10, 10, 0, 0)
};
//#endregion

//#region USER_GROUP_RELATION
export const MESSAGE_USER_GROUP_REL_INSERT: UpdateMessage = {
	type: EventType.INSERT,
	affectedObject: AffectedObject.USER_GROUP_RELATION,
	courseId: COURSE_JAVA_1920.id,
	entityId: USER_STUDENT_JAVA.id,
	entityId_relation: GROUP_1_JAVA.id,
	date: new Date(2020, 3, 16, 10, 0, 0, 0)
};

// Not necessary ?
export const MESSAGE_USER_GROUP_REL_UPDATE: UpdateMessage = {
	type: EventType.UPDATE,
	affectedObject: AffectedObject.USER_GROUP_RELATION,
	courseId: COURSE_JAVA_1920.id,
	entityId: USER_STUDENT_JAVA.id,
	entityId_relation: GROUP_1_JAVA.id,
	date: new Date(2020, 3, 16, 10, 5, 0, 0)
};

export const MESSAGE_USER_GROUP_REL_REMOVE: UpdateMessage = {
	type: EventType.REMOVE,
	affectedObject: AffectedObject.USER_GROUP_RELATION,
	courseId: COURSE_JAVA_1920.id,
	entityId: USER_STUDENT_JAVA.id,
	entityId_relation: GROUP_1_JAVA.id,
	date: new Date(2020, 3, 16, 10, 10, 0, 0)
};
//#endregion

//#region COURSE_USER_RELATION
export const MESSAGE_COURSE_USER_REL_INSERT: UpdateMessage = {
	type: EventType.INSERT,
	affectedObject: AffectedObject.COURSE_USER_RELATION,
	courseId: COURSE_JAVA_1920.id,
	entityId: COURSE_JAVA_1920.id,
	entityId_relation: USER_STUDENT_JAVA.id,
	date: new Date(2020, 3, 16, 10, 0, 0, 0)
};

export const MESSAGE_COURSE_USER_REL_UPDATE: UpdateMessage = {
	type: EventType.UPDATE,
	affectedObject: AffectedObject.COURSE_USER_RELATION,
	courseId: COURSE_JAVA_1920.id,
	entityId: COURSE_JAVA_1920.id,
	entityId_relation: USER_STUDENT_JAVA.id,
	date: new Date(2020, 3, 16, 10, 5, 0, 0)
};

export const MESSAGE_COURSE_USER_REL_REMOVE: UpdateMessage = {
	type: EventType.REMOVE,
	affectedObject: AffectedObject.COURSE_USER_RELATION,
	courseId: COURSE_JAVA_1920.id,
	entityId: COURSE_JAVA_1920.id,
	entityId_relation: USER_STUDENT_JAVA.id,
	date: new Date(2020, 3, 16, 10, 10, 0, 0)
};
//#endregion

//#region ASSIGNMENT
export const MESSAGE_ASSIGNMENT_INSERT: UpdateMessage = {
	type: EventType.INSERT,
	affectedObject: AffectedObject.ASSIGNMENT,
	courseId: COURSE_JAVA_1920.id,
	entityId: ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP.id,
	date: new Date(2020, 3, 16, 10, 0, 0, 0)
};

export const MESSAGE_ASSIGNMENT_UPDATE: UpdateMessage = {
	type: EventType.UPDATE,
	affectedObject: AffectedObject.ASSIGNMENT,
	courseId: COURSE_JAVA_1920.id,
	entityId: ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP.id,
	date: new Date(2020, 3, 16, 10, 5, 0, 0)
};

export const MESSAGE_ASSIGNMENT_REMOVE: UpdateMessage = {
	type: EventType.REMOVE,
	affectedObject: AffectedObject.ASSIGNMENT,
	courseId: COURSE_JAVA_1920.id,
	entityId: ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP.id,
	date: new Date(2020, 3, 16, 10, 10, 0, 0)
};
//#endregion

//#region USER
export const MESSAGE_USER_INSERT: UpdateMessage = {
	type: EventType.INSERT,
	affectedObject: AffectedObject.USER,
	courseId: COURSE_JAVA_1920.id,
	entityId: USER_STUDENT_JAVA.id,
	date: new Date(2020, 3, 16, 10, 0, 0, 0)
};

export const MESSAGE_USER_UPDATE: UpdateMessage = {
	type: EventType.UPDATE,
	affectedObject: AffectedObject.USER,
	courseId: COURSE_JAVA_1920.id,
	entityId: USER_STUDENT_JAVA.id,
	date: new Date(2020, 3, 16, 10, 5, 0, 0)
};

export const MESSAGE_USER_REMOVE: UpdateMessage = {
	type: EventType.REMOVE,
	affectedObject: AffectedObject.USER,
	courseId: COURSE_JAVA_1920.id,
	entityId: USER_STUDENT_JAVA.id,
	date: new Date(2020, 3, 16, 10, 10, 0, 0)
};
//#endregion

export const MESSAGES_ALL: UpdateMessage[] = [
	MESSAGE_GROUP_INSERT,
	MESSAGE_GROUP_UPDATE,
	MESSAGE_GROUP_REMOVE,

	MESSAGE_USER_GROUP_REL_INSERT,
	MESSAGE_USER_GROUP_REL_UPDATE,
	MESSAGE_USER_GROUP_REL_REMOVE,

	MESSAGE_COURSE_USER_REL_INSERT,
	MESSAGE_COURSE_USER_REL_UPDATE,
	MESSAGE_USER_GROUP_REL_REMOVE,

	MESSAGE_ASSIGNMENT_INSERT,
	MESSAGE_ASSIGNMENT_UPDATE,
	MESSAGE_ASSIGNMENT_REMOVE,

	MESSAGE_USER_INSERT,
	MESSAGE_USER_UPDATE,
	MESSAGE_USER_REMOVE
];
