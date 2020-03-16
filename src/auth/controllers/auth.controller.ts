import { Controller, Post, Body, ValidationPipe, HttpCode } from "@nestjs/common";
import { AuthCredentialsDto } from "../dto/auth-credentials.dto";
import { AuthService } from "../services/auth.service";
import { AuthTokenDto } from "../dto/auth-token.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("authentication")
@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) { }

	@Post("register")
	register(@Body(ValidationPipe) authCredentials: AuthCredentialsDto): Promise<void> {
		return this.authService.register(authCredentials);
	}

	@Post("login")
	@HttpCode(200)
	login(@Body(ValidationPipe) authCredentials: AuthCredentialsDto): Promise<AuthTokenDto> {
		return this.authService.login(authCredentials);
	}

}
