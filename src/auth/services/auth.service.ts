import { Injectable, BadRequestException, NotImplementedException } from "@nestjs/common";
import { AuthCredentialsDto, AuthSystemCredentials } from "../dto/auth-credentials.dto";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "../jwt/jwt-payload.interface";
import { AuthTokenDto } from "../dto/auth-token.dto";
import { AuthSystemService } from "./auth-system.service";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "../../user/repositories/user.repository";
import { User } from "../../shared/entities/user.entity";
import { UserRole } from "../../shared/enums";

@Injectable()
export class AuthService {

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

		// Find user in this system
		let user: User;
		try {
			user = await this.userRepository.getUserByUsername(authInfo.user.username);
		} catch(error) {
			// User does not exist, create account in this system
			user = await this.userRepository.createUser({
				username: authInfo.user.username,
				rzName: "?", // TODO: Remove property ?
				email: authInfo.user.settings?.email_address,
				role: UserRole.USER
			});
		}

		// Create AuthToken for the user
		return this.generateAuthToken(user);
	}

	/**
	 * Login for local users.
	 * Returns an AuthToken (containing a JWT), which allows the user to authenticate himself
	 * in future requests.
	 */
	async login(authCredentials: AuthCredentialsDto): Promise<AuthTokenDto> {
		throw new NotImplementedException();

		// Check if credentials were valid
		const isValid = true; // TODO: Implement

		// If credentials were invalid
		if (!isValid) throw new BadRequestException("Invalid credentials");

		// Create AuthToken for the user
		const user = await this.userRepository.getUserByEmail(authCredentials.email);
		return this.generateAuthToken(user);
	}


	/**
	 * Returns an AuthToken containing a JWT and information about the user. 
	 */
	async generateAuthToken(user: User): Promise<AuthTokenDto> {
		// Generate JWT Token
		const payload: JwtPayload = { username: user.username, role: user.role };
		const accessToken = await this.jwtService.signAsync(payload);
		
		// Configure the AuthToken, that gets send back to user
		const authToken: AuthTokenDto = { 
			accessToken: accessToken, // JWT (encrypted)
			userId: user.id,
			email: user.email,
			role: user.role
		};
		
		return authToken;
	}
}
