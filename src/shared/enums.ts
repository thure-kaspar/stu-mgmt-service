export enum AssignmentStates {
	INVISIBLE = "INVISIBLE", // Assigment is not opened for submissions. Students can't see it.
	IN_PROGRESS = "IN_PROGRESS", // Assignment is open for submissions
	IN_REVIEW = "IN_REVIEW", // Assignment is closed for submissions.
	EVALUATED = "EVALUATED" // Assignment has been evaluated.
}

export enum AssignmentTypes {
	HOMEWORK = "HOMEWORK",
	TESTAT = "TESTAT", // TODO: english name ? 
	SEMINAR = "SEMINAR",
	OTHER = "OTHER"
}

export enum UserRoles {
	SYSTEM_ADMIN = "SYSTEM_ADMIN",
	ADMIN_TOOL = "ADMIN_TOOL",
	MGMT_ADMIN = "MGTM_ADMIN",
	LECTURER = "LECTURER",
	TUTOR = "TUTOR",
	STUDENT = "STUDENT"
}