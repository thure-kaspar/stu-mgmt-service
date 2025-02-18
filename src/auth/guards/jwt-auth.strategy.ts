import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { UserDto } from "../../shared/dto/user.dto";
import { CacheService } from "../cache.service";
import { AuthStrategy } from "./auth.strategy";
import { UserRepository } from "src/user/repositories/user.repository";
import { DtoFactory } from "src/shared/dto-factory";
import { jwtDecode } from "jwt-decode";
import { AuthService } from "../services/auth.service";

@Injectable()
export class JwtAuthStrategy extends AuthStrategy {
	constructor(
		private cache: CacheService,
		private readonly userRepository: UserRepository,
		private readonly authService: AuthService
	) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const token = this.validateAuthHeader(request.headers.authorization);

		const jwtContent = jwtDecode(token);
		const username = jwtContent["preferred_username"];

		const errorMsg0 = "JWT has no '";
		const errorMsg1 = "' field. Maybe the identity provider is misconfigured."

		if (username === undefined) {
			throw new UnauthorizedException(errorMsg0 + "preferred_username" + errorMsg1);
		}

		let user = this.cache.get<UserDto>(username);

		if (!user) {
			let existingUser = await this.userRepository.tryGetUserByUsername(username);

			if (!existingUser) {
				// Fresh user login -> add new user to StudMngmt database
				// Only in this case create the user
				const fullname = jwtContent["name"];
				const email = jwtContent["email"];
				const roles = jwtContent["realm_access"]["roles"]; // TODO: Implement role support 

				if (fullname === undefined) {
					throw new UnauthorizedException(errorMsg0 + "name" + errorMsg1);
				}
				if (email === undefined) {
					throw new UnauthorizedException(errorMsg0 + "email" + errorMsg1);
				}
				if (roles === undefined) {
					throw new UnauthorizedException(errorMsg0 + "roles" + "' array. Maybe the identity provider is misconfigured.");
				}
				existingUser = await this.authService.createUser(username, fullname, email, []);
				console.log("Created new user for: " + existingUser.displayName);
			}

			user = DtoFactory.createUserDto(existingUser);
			this.cache.set(username, user);
		}

		request["user"] = user;
		return true;
	}
}
