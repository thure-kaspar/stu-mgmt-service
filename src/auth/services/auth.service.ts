import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthCredentialsDto } from "../dto/auth-credentials.dto";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "../jwt/jwt-payload.interface";
import { AuthTokenDto } from "../dto/auth-token.dto";
import { AuthSystemService } from "./auth-system.service";

@Injectable()
export class AuthService {

	constructor(private jwtService: JwtService,
				private authSystem: AuthSystemService) { }


	async register(authCredentials: AuthCredentialsDto): Promise<void> {
		return null;
	}

	/**
	 * Returns an AuthToken (containing a JWT), which allows the user to authenticate himself
	 * in future requests.
	 */
	async login(authCredentials: AuthCredentialsDto): Promise<AuthTokenDto> {
		// Check if credentials were valid
		const isValid = await this.authSystem.login(authCredentials);

		if (!isValid) {
			throw new UnauthorizedException("Invalid credentials");
		}

		// Get user
		const user = await this.authSystem.getUser(authCredentials.email);

		// Generate JWT Token
		const payload: JwtPayload = { email: authCredentials.email };
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
