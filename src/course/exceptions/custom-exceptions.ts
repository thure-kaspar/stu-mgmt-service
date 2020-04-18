import { ForbiddenException } from "@nestjs/common";

export class CourseClosedException extends ForbiddenException {
	constructor(message = "Course is closed.") {
		super(message);
	}
}

export class GroupsForbiddenException extends ForbiddenException {
	constructor(message = "Groups are forbidden.") {
		super(message);
	}
}
