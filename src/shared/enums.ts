import { ParticipantDto } from "../course/dto/course-participant/participant.dto";

export enum AssignmentState {
	INVISIBLE = "INVISIBLE", // Assigment is not opened for submissions. Students can't see it.
	CLOSED = "CLOSED", // Assignment is closed for submissions. Students can see it.
	IN_PROGRESS = "IN_PROGRESS", // Assignment is open for submissions
	IN_REVIEW = "IN_REVIEW", // Assignment is closed for submissions.
	EVALUATED = "EVALUATED" // Assignment has been evaluated.
}

export enum AssignmentType {
	HOMEWORK = "HOMEWORK",
	TESTAT = "TESTAT", // TODO: english name ?
	SEMINAR = "SEMINAR",
	PROJECT = "PROJECT",
	OTHER = "OTHER"
}

export enum CollaborationType {
	GROUP = "GROUP",
	SINGLE = "SINGLE",
	GROUP_OR_SINGLE = "GROUP_OR_SINGLE"
}

export enum UserRole {
	SYSTEM_ADMIN = "SYSTEM_ADMIN",
	ADMIN_TOOL = "ADMIN_TOOL",
	MGMT_ADMIN = "MGMT_ADMIN",
	USER = "USER"
}

export enum CourseRole {
	LECTURER = "LECTURER",
	TUTOR = "TUTOR",
	STUDENT = "STUDENT"
}

/**
 * Checks, if `courseRole` of a user is `STUDENT`.
 * @returns `true`, if user is `STUDENT`.
 */
export function isStudent(participant: ParticipantDto): boolean {
	return participant.role === CourseRole.STUDENT;
}

/**
 * Checks, if `courseRole` of a user is `TUTOR`.
 * @returns `true`, if user is `TUTOR`.
 */
export function isTutor(participant: ParticipantDto): boolean {
	return participant.role === CourseRole.TUTOR;
}

/**
 * Checks, if `courseRole` of a user is `LECTURER`.
 * @returns `true`, if user is `LECTURER`.
 */
export function isLecturer(participant: ParticipantDto): boolean {
	return participant.role === CourseRole.LECTURER;
}

const adminRoles = [UserRole.SYSTEM_ADMIN, UserRole.MGMT_ADMIN, UserRole.ADMIN_TOOL];
export function isAdmin(role: UserRole): boolean {
	return adminRoles.includes(role);
}
