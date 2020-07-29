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

export class NotATeachingStaffMember extends ForbiddenException {
	constructor(courseId: CourseId, userId: string) {
		super(`User (${userId}) is not a member of teaching staff in course (${courseId}).`, "NotATeachingStaffMember");
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
	NotATeachingStaffMember = "NotATeachingStaffMember",
	GroupsForbiddenException = "GroupsForbiddenException"
}

export class StudentMgmtException {
	@ApiProperty({ enum: StudentMgmtExceptions })
	name: StudentMgmtException;
}
