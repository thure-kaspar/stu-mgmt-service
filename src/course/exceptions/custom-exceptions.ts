import { ConflictException, ForbiddenException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { CourseId } from "../entities/course.entity";
import { GroupId } from "../entities/group.entity";
import { UserId } from "../../shared/entities/user.entity";

export class CourseClosedException extends ForbiddenException {
	constructor(courseId: CourseId) {
		super(`Course (${courseId}) is closed.`, "CourseClosedException");
	}
}

export class NotACourseMemberException extends ForbiddenException {
	constructor(courseId: CourseId, userId: UserId) {
		super(`User (${userId}) is not a member of course (${courseId}).`, "NotACourseMemberException");
	}
}

export class NotATeachingStaffMember extends ForbiddenException {
	constructor(courseId: CourseId, userId: UserId) {
		super(`User (${userId}) is not a member of teaching staff in course (${courseId}).`, "NotATeachingStaffMember");
	}
}

export class GroupClosedException extends ForbiddenException {
	constructor(groupId: GroupId) {
		super(`Group (${groupId}) is closed.`, "GroupClosedException");
	}
}

export class NotAGroupMemberException extends ForbiddenException {
	constructor(groupId: GroupId, userId: UserId) {
		super(`User (${userId}) is not a member of group (${groupId}).`, "NotAGroupMemberException");
	}
}

export class GroupsForbiddenException extends ForbiddenException {
	constructor(courseId: CourseId) {
		super(`Course (${courseId}) does not allow group creation.`, "GroupsForbiddenException");
	}
}

export class AlreadyInGroupException extends ConflictException {
	constructor(userId: UserId, groupId: GroupId) {
		super(`User (${userId}) is already member of a group (${groupId}).`, "AlreadyInGroupException");
	}
}

export class GroupFullException extends ConflictException {
	constructor(groupId: GroupId) {
		super(`Group (${groupId}) is full.`, "GroupFullException");
	}
}

export class InvalidPasswordException extends ForbiddenException {
	constructor() {
		super("The given password was invalid.", "InvalidPasswordException");
	}
}

// ### Export for swagger ###
enum StudentMgmtExceptions {
	CourseClosedException = "CourseClosedException",
	NotACourseMemberException = "NotACourseMemberException",
	NotATeachingStaffMember = "NotATeachingStaffMember",
	GroupClosedException = "GroupClosedException",
	NotAGroupMemberException = "NotAGroupMemberException",
	GroupsForbiddenException = "GroupsForbiddenException",
	AlreadyInGroupException = "AlreadyInGroupException"
}

export class StudentMgmtException {
	@ApiProperty({ enum: StudentMgmtExceptions })
	name: StudentMgmtException;
}
