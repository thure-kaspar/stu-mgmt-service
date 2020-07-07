import { ExecutionContext } from "@nestjs/common";
import { USER_SYSTEM_ADMIN } from "./users.mock";
import { copy } from "../utils/object-helper";

export class AuthGuardMock { 

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		request.user = copy(USER_SYSTEM_ADMIN);
		return true; 
	}
}

export class RoleGuardMock { canActivate(): boolean { return true; }}
export class CourseMemberGuardMock { canActivate(): boolean { return true; }}
