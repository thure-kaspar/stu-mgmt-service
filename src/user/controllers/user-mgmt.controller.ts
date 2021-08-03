import { Controller, NotImplementedException, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRole } from "../../shared/enums";
import { UserRepository } from "../repositories/user.repository";

@ApiBearerAuth()
@ApiTags("user-mgmt")
@Controller("user-mgmt")
export class UserManagementController {
	constructor(@InjectRepository(UserRepository) private userRepository: UserRepository) {}

	@ApiOperation({
		operationId: "setUserRole",
		summary: "Set user role.",
		description: ""
	})
	@Post("users/:userId/role")
	setUserRole(role: { role: UserRole }): Promise<void> {
		throw new NotImplementedException();
	}
}
