import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { DtoFactory } from "../../shared/dto-factory";
import { UserDto } from "../../shared/dto/user.dto";
import { UserRepository } from "../../user/repositories/user.repository";
import { GetUser } from "../decorators/get-user.decorator";
import { AuthGuard } from "../guards/auth.guard";

@ApiBearerAuth()
@ApiTags("authentication")
@Controller("auth")
export class AuthController {
	constructor(@InjectRepository(UserRepository) private userRepository: UserRepository) {}

	@Get("whoAmI")
	@ApiOperation({
		operationId: "whoAmI",
		summary: "Get user.",
		description: "Returns the authenticated user."
	})
	@UseGuards(AuthGuard)
	async whoAmI(@GetUser() user: UserDto): Promise<UserDto> {
		const _user = await this.userRepository.getUserById(user.id);
		return DtoFactory.createUserDto(_user);
	}
}
