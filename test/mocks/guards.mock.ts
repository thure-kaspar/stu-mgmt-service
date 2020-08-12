/* eslint-disable @typescript-eslint/class-name-casing */
import { ExecutionContext } from "@nestjs/common";
import { Course as CourseEntity } from "../../src/course/entities/course.entity";
import { Participant as ParticipantEntity } from "../../src/course/entities/participant.entity";
import { Course } from "../../src/course/models/course.model";
import { Participant } from "../../src/course/models/participant.model";
import { User } from "../../src/shared/entities/user.entity";
import { CourseRole } from "../../src/shared/enums";
import { convertToEntity, copy } from "../utils/object-helper";
import { COURSE_JAVA_1920 } from "./courses.mock";
import { USER_MGMT_ADMIN_JAVA_LECTURER, USER_SYSTEM_ADMIN, USER_STUDENT_JAVA } from "./users.mock";
import { COURSE_JAVA_1920_PARTICIPANTS } from "./participants/participants.mock";

export class AuthGuardMock { 
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		request.user = copy(USER_SYSTEM_ADMIN);
		return true; 
	}
}

export class RoleGuardMock { canActivate(): boolean { return true; }}

export class CourseMemberGuardMock_LECTURER { 
	canActivate(context: ExecutionContext): boolean { 
		const request = context.switchToHttp().getRequest();
		
		const course = convertToEntity(CourseEntity, COURSE_JAVA_1920);
		const participant = new ParticipantEntity({
			id: 4,
			userId: USER_MGMT_ADMIN_JAVA_LECTURER.id,
			user: convertToEntity(User, USER_MGMT_ADMIN_JAVA_LECTURER),
			role: CourseRole.LECTURER
		});
		
		request.course = new Course(course);
		request.participant = new Participant(participant);

		return true; 
	}
}

export class CourseMemberGuardMock_STUDENT { 
	canActivate(context: ExecutionContext): boolean { 
		const request = context.switchToHttp().getRequest();
		
		const course = convertToEntity(CourseEntity, COURSE_JAVA_1920);
		const participant = new ParticipantEntity({
			id: 1,
			userId: USER_STUDENT_JAVA.id,
			user: convertToEntity(User, USER_STUDENT_JAVA),
			role: CourseRole.STUDENT
		});
		
		request.course = new Course(course);
		request.participant = new Participant(participant);

		return true; 
	}
}
