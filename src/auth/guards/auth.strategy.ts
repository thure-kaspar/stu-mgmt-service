import { ExecutionContext, UnauthorizedException } from "@nestjs/common";

export abstract class AuthStrategy {
	abstract canActivate(context: ExecutionContext): boolean | Promise<boolean>;

	validateAuthHeader(authorization: string): string {
		if (!authorization) {
			throw new UnauthorizedException("Authorization header is missing.");
		}

		if (!authorization.startsWith("Bearer ")) {
			throw new UnauthorizedException(
				"Incorrect Authorization header format (Requires: Bearer TOKEN)."
			);
		}

		return authorization.substr(7); // Extract TOKEN from "Bearer TOKEN"
	}
}
