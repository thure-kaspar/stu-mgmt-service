import { ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { UserDto } from "../../shared/dto/user.dto";
import { CacheService } from "../cache.service";
import { SparkyService } from "../services/sparky.service";
import { AuthService } from "../services/auth.service";
import { AuthStrategy } from "./auth.strategy";

@Injectable()
export class SparkyAuthStrategy extends AuthStrategy {
	constructor(
		private cache: CacheService,
		private authService: AuthService,
		private authSystem: SparkyService
	) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const token = this.validateAuthHeader(request.headers.authorization);

		let user = this.cache.get<UserDto>(token);

		if (!user) {
			const extUser = await this.authSystem.checkAuthentication({ token });
			user = await this.authService.getOrCreateUser(extUser);
			this.cache.set(token, user);
		}

		request["user"] = user;
		return true;
	}
}
