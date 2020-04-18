import { Controller, Post, Body, ValidationPipe, HttpCode } from "@nestjs/common";
import { AuthCredentialsDto, AuthSystemCredentials } from "../dto/auth-credentials.dto";
import { AuthService } from "../services/auth.service";
import { AuthTokenDto } from "../dto/auth-token.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("authentication")
@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) { }

	@Post("register")
	@ApiOperation({
		operationId: "register",
		summary: "Register user",
		description: "Creates a new account."
	})
	register(@Body(ValidationPipe) authCredentials: AuthCredentialsDto): Promise<void> {
		return this.authService.register(authCredentials);
	}

	/** Logs the user in to the StudentMgmt-Backend directly. */
	@Post("login")
	@ApiOperation({
		operationId: "login",
		summary: "Login",
		description: "Logs the user in to the StudentMgmt-Backend directly."
	})
	@HttpCode(200)
	login(@Body(ValidationPipe) authCredentials: AuthCredentialsDto): Promise<AuthTokenDto> {
		return this.authService.login(authCredentials);
	}


	/** Logs the user in to the StudentMgmt-Backend via the credentials provided by the external authentication system. */
	@Post("loginWithToken")
	@ApiOperation({
		operationId: "loginWithToken",
		summary: "Login with token",
		description: "Logs the user in to the StudentMgmt-Backend via the credentials provided by the external authentication system."
	})
	@HttpCode(200)
	loginWithToken(@Body(ValidationPipe) credentials: AuthSystemCredentials): Promise<AuthTokenDto> {
		return this.authService.loginWithToken(credentials);
	}

}
