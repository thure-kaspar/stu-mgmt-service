import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserDto } from "../../shared/dto/user.dto";
import { GetUser } from "../decorators/get-user.decorator";
import { AuthResultDto } from "../dto/auth-result.dto";
import { CredentialsDto } from "../dto/credentials.dto";
import { AuthGuard } from "../guards/auth.guard";
import { AuthService } from "../services/auth.service";

@ApiBearerAuth()
@ApiTags("authentication")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get("whoAmI")
	@ApiOperation({
		operationId: "whoAmI",
		summary: "Get user.",
		description: "Returns the authenticated user."
	})
	@UseGuards(AuthGuard)
	async whoAmI(@GetUser() user: UserDto): Promise<UserDto> {
		return this.authService.getUserById(user.id);
	}

	@Post("login")
	@ApiOperation({
		operationId: "login",
		summary: "Login.",
		description:
			"Attempts to authenticate the user with SparkyService. If successful, returns information about this user and an access token."
	})
	login(@Body() credentials: CredentialsDto): Promise<AuthResultDto> {
		return this.authService.login(credentials);
	}
}
