import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DtoFactory } from "../../shared/dto-factory";
import { UserDto } from "../../shared/dto/user.dto";
import { User } from "../../shared/entities/user.entity";
import { UserRole } from "../../shared/enums";
import { UserRepository } from "../../user/repositories/user.repository";
import { AuthInfo } from "../dto/auth-info.dto";
import { AuthResultDto } from "../dto/auth-result.dto";
import { CredentialsDto } from "../dto/credentials.dto";
import { HttpService } from "@nestjs/axios";
import { SparkyService } from "./sparky.service";

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly userRepository: UserRepository
	) {}

	async getUserById(id: string): Promise<UserDto> {
		const user = await this.userRepository.getUserById(id);
		return DtoFactory.createUserDto(user);
	}

	/**
	 * Attempts to authenticate the user with {@link SparkyService} using the given credentials.
	 * If the user does not exists already, a new {@link User} will be created.
	 *
	 * @param credentials
	 */
	async login(credentials: CredentialsDto): Promise<AuthResultDto> {
		// TODO: Create user if they don't exist after loggin in with Keycloak
		const sparkyService = new SparkyService(new HttpService)
		const authInfo = await sparkyService.authenticate(credentials);
		const user = await this.getOrCreateUser(authInfo);
		return {
			user,
			accessToken: authInfo.token.token,
			expiration: authInfo.token.expiration ? new Date(authInfo.token.expiration) : undefined
		};
	}

	/**
	 * Tries to look up the external user by their `username`.
	 * If it does not exists, the user will be created.
	 *
	 * @param extUser - AuthInfo returned from SparkyService.
	 */
	async getOrCreateUser(extUser: AuthInfo): Promise<UserDto> {
		// Try to find user in this system
		let intUser = await this.userRepository.tryGetUserByUsername(extUser.user.username);

		if (!intUser) {
			// User does not exist, create account in this system
			intUser = await this.createUser(extUser);
			this.logger.verbose("Created new user: " + intUser.username);
		} else if (this.userInfoHasChanged(intUser, extUser)) {
			intUser = await this.updateUser(intUser, extUser);
		}

		return DtoFactory.createUserDto(intUser);
	}

	/**
	 * Updates the user's `email` and `displayName` according to the information received
	 * from Sparkyservice.
	 */
	async updateUser(user: User, authInfo: AuthInfo): Promise<User> {
		return this.userRepository.updateUser(user.id, {
			...user,
			email: authInfo.user.settings.emailAddress,
			displayName: authInfo.user.fullName ?? user.username
		});
	}

	/**
	 * Returns `true`, if the user's `email` or `displayName` have been changed by Sparkyservice.
	 */
	userInfoHasChanged(user: User, authInfo: AuthInfo): boolean {
		return (
			user.email !== authInfo.user.settings.emailAddress ||
			user.displayName !== authInfo.user.fullName
		);
	}

	async createUser(authInfo: AuthInfo): Promise<User> {
		const username = authInfo.user.username;
		const displayName =
			authInfo.user.fullName?.length > 0 ? authInfo.user.fullName : authInfo.user.username;
		const role = this.determineRole(authInfo.user.role);
		const email = authInfo.user.settings?.emailAddress;

		return this.userRepository.createUser({
			id: undefined,
			username,
			displayName,
			email,
			role
		});
	}

	/**
	 * Determines the role of a new account.
	 * @param role Role given by the Sparkyservice.
	 */
	private determineRole(role: string): UserRole {
		switch (role) {
			case "DEFAULT":
				return UserRole.USER;
			case "ADMIN":
				return UserRole.SYSTEM_ADMIN;
			case "SERVICE":
				return UserRole.ADMIN_TOOL;
			default:
				return UserRole.USER;
		}
	}
}
