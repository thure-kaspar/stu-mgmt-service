import { ForbiddenException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { CourseId } from "../entities/course.entity";

export class CourseClosedException extends ForbiddenException {
	constructor(courseId: CourseId) {
		super(`Course (${courseId}) is closed.`, "CourseClosedException");
	}
}

export class NotACourseMemberException extends ForbiddenException {
	constructor(courseId: CourseId, userId: string) {
		super(`User (${userId}) is not a member of course (${courseId}).`, "NotACourseMemberException");
	}
}

export class GroupsForbiddenException extends ForbiddenException {
	constructor(courseId: CourseId) {
		super(`Course (${courseId}) does not allow group creation.`, "GroupsForbiddenException");
	}
}

// ### Export for swagger ###
enum StudentMgmtExceptions {
	CourseClosedException = "CourseClosedException",
	NotACourseMemberException = "NotACourseMemberException",
	GroupsForbiddenException = "GroupsForbiddenException"
}

export class StudentMgmtException {
	@ApiProperty({ enum: StudentMgmtExceptions })
	name: StudentMgmtException;
}
