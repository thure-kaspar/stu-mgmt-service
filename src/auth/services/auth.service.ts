import { Injectable, Logger } from "@nestjs/common";
import { DtoFactory } from "../../shared/dto-factory";
import { UserDto } from "../../shared/dto/user.dto";
import { User } from "../../shared/entities/user.entity";
import { UserRole } from "../../shared/enums";
import { UserRepository } from "../../user/repositories/user.repository";

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
	 * Tries to look up the external user by their `username`.
	 * If it does not exists, the user will be created.
	 */
	async getOrCreateUser(username: string, fullName: string, roles: string[], email: string): Promise<UserDto> {
		// Try to find user in this system
		let intUser = await this.userRepository.tryGetUserByUsername(username);

		if (!intUser) {
			// User does not exist, create account in this system
			intUser = await this.createUser(username, fullName, email, roles);
			this.logger.verbose("Created new user: " + intUser.username);
		} else if (this.userInfoHasChanged(intUser, fullName, email)) {
			intUser = await this.updateUser(intUser, fullName, email);
		}

		return DtoFactory.createUserDto(intUser);
	}

	/**
	 * Updates the user's `email` and `displayName` according to the information received
	 * from Identity provider.
	 */
	async updateUser(user: User, fullName: string, email: string): Promise<User> {
		return this.userRepository.updateUser(user.id, {
			...user,
			email: email,
			displayName: fullName ?? user.username
		});
	}

	/**
	 * Returns `true`, if the user's `email` or `displayName` have been changed by Identity provider.
	 */
	userInfoHasChanged(user: User, fullName: string, email: string): boolean {
		return (
			user.email !== email ||
			user.displayName !== fullName
		);
	}

	async createUser(username: string, fullName: string, email: string, roles: string[]): Promise<User> {
		if (fullName == undefined) {
			fullName = "";
		}
		const displayName =
			fullName.length > 0 ? fullName : username;
		const role = this.determineRole(roles);

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
	 * The role with the highest permissions will be used. 
	 * 
	 * @param roles Array of roles from Identity provider
	 */
	private determineRole(roles: string[]): UserRole {
		if (roles.length == 0) {
			return UserRole.USER;
		}
		// TODO: Actually implement logic to extract highest value role from array.
		const role = roles[0];

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
