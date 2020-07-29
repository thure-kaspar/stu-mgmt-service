import { UserDto } from "./dto/user.dto";

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
	MGMT_ADMIN = "MGTM_ADMIN",
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
export function isStudent(user: UserDto): boolean {
	return user.courseRole === CourseRole.STUDENT;
}

/**
 * Checks, if `courseRole` of a user is `TUTOR`.
 * @returns `true`, if user is `TUTOR`.
 */
export function isTutor(user: UserDto): boolean {
	return user.courseRole === CourseRole.TUTOR;
}

/**
 * Checks, if `courseRole` of a user is `LECTURER`.
 * @returns `true`, if user is `LECTURER`.
 */
export function isLecturer(user: UserDto): boolean {
	return user.courseRole === CourseRole.LECTURER;
}
