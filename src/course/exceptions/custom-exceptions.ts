import { ForbiddenException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

export class CourseClosedException extends ForbiddenException {
	constructor() {
		super("CourseClosedException");
	}
}

export class NotACourseMemberException extends ForbiddenException {
	constructor() {
		super("NotACourseMemberException");
	}
}

export class GroupsForbiddenException extends ForbiddenException {
	constructor() {
		super("GroupsForbiddenException");
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
