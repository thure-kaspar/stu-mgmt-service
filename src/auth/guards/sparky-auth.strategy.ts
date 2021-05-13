import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { DtoFactory } from "../../shared/dto-factory";
import { UserDto } from "../../shared/dto/user.dto";
import { UserRepository } from "../../user/repositories/user.repository";
import { CacheService } from "../cache.service";
import { AuthInfo } from "../dto/auth-info.dto";
import { AuthSystemService } from "../services/auth-system.service";
import { AuthService } from "../services/auth.service";
import { AuthStrategy } from "./auth.strategy";

@Injectable()
export class SparkyAuthStrategy extends AuthStrategy {
	constructor(
		private cache: CacheService,
		private authService: AuthService,
		private authSystem: AuthSystemService,
		@InjectRepository(UserRepository) private userRepository: UserRepository
	) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const token = this.validateAuthHeader(request.headers.authorization);

		let user = this.cache.get<UserDto>(token);

		if (!user) {
			const extUser = await this.authSystem.checkAuthentication({ token });

			if (!extUser) {
				throw new UnauthorizedException("Failed to authenticate with Sparkyservice.");
			}

			user = await this.getOrCreateUser(extUser);
			this.cache.set(token, user);
		}

		request["user"] = user;
		return true;
	}

	private async getOrCreateUser(extUser: AuthInfo): Promise<UserDto> {
		// Try to find user in this system
		let intUser = await this.userRepository.tryGetUserByUsername(extUser.user.username);

		if (!intUser) {
			// User does not exist, create account in this system
			intUser = await this.authService.createUser(extUser);
		} else if (this.authService.userInfoHasChanged(intUser, extUser)) {
			intUser = await this.authService.updateUser(intUser, extUser);
		}

		return DtoFactory.createUserDto(intUser);
	}
}
