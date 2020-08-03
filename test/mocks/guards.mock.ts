import { ExecutionContext } from "@nestjs/common";
import { USER_SYSTEM_ADMIN } from "./users.mock";
import { copy } from "../utils/object-helper";
import { ParticipantDto } from "../../src/course/dto/course-participant/participant.dto";
import { CourseRole } from "../../src/shared/enums";

export class AuthGuardMock { 
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		request.user = copy(USER_SYSTEM_ADMIN);
		return true; 
	}
}

export class RoleGuardMock { canActivate(): boolean { return true; }}

export class CourseMemberGuardMock { 
	canActivate(context: ExecutionContext): boolean { 
		const request = context.switchToHttp().getRequest();
		
		const participant: ParticipantDto = {
			username: USER_SYSTEM_ADMIN.username,
			rzName: USER_SYSTEM_ADMIN.rzName,
			userId: USER_SYSTEM_ADMIN.id,
			role: CourseRole.LECTURER
		};

		request.participant = participant;
		return true; 
	}
}
