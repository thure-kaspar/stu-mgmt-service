import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../shared/entities/user.entity";
import { UserRole } from "../../shared/enums";
import { UserRepository } from "../../user/repositories/user.repository";
import { AuthInfo } from "../dto/auth-info.dto";

@Injectable()
export class AuthService {
	constructor(@InjectRepository(UserRepository) private userRepository: UserRepository) {}

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
			(user.displayName !== authInfo.user.fullName && authInfo.user.fullName?.length > 0)
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
