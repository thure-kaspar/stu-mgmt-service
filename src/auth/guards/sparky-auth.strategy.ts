import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { UserDto } from "../../shared/dto/user.dto";
import { CacheService } from "../cache.service";
import { AuthStrategy } from "./auth.strategy";
import { UserRepository } from "src/user/repositories/user.repository";
import { DtoFactory } from "src/shared/dto-factory";
import { jwtDecode } from "jwt-decode";

@Injectable()
export class SparkyAuthStrategy extends AuthStrategy {
	constructor(
		private cache: CacheService,
		private readonly userRepository: UserRepository
	) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const token = this.validateAuthHeader(request.headers.authorization);

		const jwtContent = jwtDecode(token);
		const username = jwtContent["preferred_username"];

		let user = this.cache.get<UserDto>(username);

		if (!user) {
			const testUser = await this.userRepository.tryGetUserByUsername(username);

			if (!testUser) {
				throw new UnauthorizedException("Unknown sparky username: " + username);
			}

			user = DtoFactory.createUserDto(testUser);
			this.cache.set(username, user);
		}

		request["user"] = user;
		return true;
	}
}
