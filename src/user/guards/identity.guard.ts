import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { UserDto } from "../../shared/dto/user.dto";
import { UserRole } from "../../shared/enums";

/**
 * Only allows requests that refer to data about the requesting user himself.
 * Additionally, requests by `SYSTEM_ADMIN` and `MGMT_ADMIN` and `ADMIN_TOOL` will be allowed.
 */
@Injectable()
export class IdentityGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const userId = request.params.userId;
		const user = request.user as UserDto;

		// Check if requesting user is requesting information about himself
		if (user.id === userId) {
			return true;
		}

		if (
			user.role === UserRole.SYSTEM_ADMIN ||
			user.role === UserRole.MGMT_ADMIN ||
			user.role === UserRole.ADMIN_TOOL
		) {
			return true;
		}

		throw new ForbiddenException(
			"Resource can only be accessed by its owner or privileged users."
		);
	}
}
