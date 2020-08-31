import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

/**
 * Only allows requests for users, that have the required role.
 */
@Injectable()
export class RoleGuard implements CanActivate {
	
	constructor(private readonly reflector: Reflector) { }

	canActivate(context: ExecutionContext): boolean {	
		// Get required roles for the requested route
		const roles = this.reflector.get<string[]>("roles", context.getHandler());

		// If no roles were specified for the request, return true (execute request)
		if (!roles) return true; 

		// Get user from HTTP-Request (authorized user gets attached to request object!)
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		// Return true, if user's role is included in required roles
		return roles.includes(user.role);
	}

}
