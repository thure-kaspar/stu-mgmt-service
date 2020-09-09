import { Injectable, BadRequestException, NotImplementedException, Logger } from "@nestjs/common";
import { AuthCredentialsDto, AuthSystemCredentials } from "../dto/auth-credentials.dto";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "../jwt/jwt-payload.interface";
import { AuthTokenDto } from "../dto/auth-token.dto";
import { AuthSystemService } from "./auth-system.service";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "../../user/repositories/user.repository";
import { User } from "../../shared/entities/user.entity";
import { UserRole } from "../../shared/enums";
import { AuthInfo } from "../dto/auth-info.dto";
import { DtoFactory } from "../../shared/dto-factory";
import * as config from "config";

@Injectable()
export class AuthService {

	private jwtExpiresIn = config.get("jwt.expiresIn");

	constructor(private jwtService: JwtService,
				private authSystem: AuthSystemService,
				@InjectRepository(UserRepository) private userRepository: UserRepository) { }


	async register(authCredentials: AuthCredentialsDto): Promise<void> {
		return null;
	}

	/**
	 * Login via the authentication token provided by the external authentication system.
	 * If the given token is valid, returns an AuthToken (containing a JWT), 
	 * which allows the user to authenticate himself in future requests.
	 */
	async loginWithToken(credentials: AuthSystemCredentials): Promise<AuthTokenDto> {
		// Check if user is authenticated in authentication system
		const authInfo = await this.authSystem.checkAuthentication(credentials);
		if (!authInfo) throw new BadRequestException("Invalid credentials");
		
		// Try to find user in this system
		let user: User;
		user = await this.userRepository.tryGetUserByUsername(authInfo.user.username);

		if (!user) {
			// User does not exist, create account in this system
			user = await this.createUser(authInfo);
		} else if (this.userInfoHasChanged(user, authInfo)) {
			user = await this.updateUser(user, authInfo);
		}

		return this.generateAuthToken(user);
	}

	/**
	 * Updates the user's `email` and `displayName` according to the information received
	 * from Sparkyservice.
	 */
	private async updateUser(user: User, authInfo: AuthInfo): Promise<User> {
		return this.userRepository.updateUser(user.id, {
			...user,
			email: authInfo.user.settings.emailAddress,
			displayName: authInfo.user.fullName
		});
	}

	/**
	 * Returns `true`, if the user's `email` or `displayName` have been changed by Sparkyservice.
	 */
	private userInfoHasChanged(user: User, authInfo: AuthInfo): boolean {
		return user.email !== authInfo.user.settings.emailAddress || user.displayName !== authInfo.user.fullName;
	}

	private async createUser(authInfo: AuthInfo) {
		const username = authInfo.user.username;
		const displayName = authInfo.user.fullName?.length > 0 ? authInfo.user.fullName : authInfo.user.username;
		const role = this.determineRole(authInfo.user.role);
		const email = authInfo.user.settings?.emailAddress;

		return this.userRepository.createUser({ username, displayName, email, role });
	}

	/**
	 * Determines the role of a new account.
	 * @param role Role given by the Sparkyservice.
	 */
	private determineRole(role: string): UserRole {
		switch (role) {
		case "DEFAULT": return UserRole.USER;
		case "ADMIN": return UserRole.SYSTEM_ADMIN;
		case "SERVICE": return UserRole.ADMIN_TOOL;
		default: return UserRole.USER;
		}
	}

	/**
	 * Login for local users.
	 * Returns an AuthToken (containing a JWT), which allows the user to authenticate himself
	 * in future requests.
	 */
	async login(authCredentials: AuthCredentialsDto): Promise<AuthTokenDto> {
		// TODO
		if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "demo") {
			throw new NotImplementedException();
		}

		// Create AuthToken for the user
		const user = await this.userRepository.getUserByEmail(authCredentials.email);
		return this.generateAuthToken(user);
	}


	/**
	 * Returns an AuthToken containing a JWT and information about the user. 
	 */
	async generateAuthToken(user: User): Promise<AuthTokenDto> {
		// Generate JWT Token
		const payload: JwtPayload = { userId: user.id, username: user.username, role: user.role };
		const accessToken = await this.jwtService.signAsync(payload);
		const expiresIn = new Date(Date.now() + this.jwtExpiresIn * 1000);
		
		// Configure the AuthToken, that gets send back to user
		const authToken: AuthTokenDto = { 
			accessToken: accessToken, // JWT (encrypted)
			user: DtoFactory.createUserDto(user),
			expiration: expiresIn,
			_expirationInLocale: expiresIn.toLocaleString()
		};
		
		return authToken;
	}
}
