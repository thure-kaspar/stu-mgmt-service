import { Controller, Post, NotImplementedException } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UserRole } from "../../shared/enums";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../shared/entities/user.entity";
import { UserRepository } from "../repositories/user.repository";

@ApiBearerAuth()
@ApiTags("user-mgmt")
@Controller("user-mgmt")
export class UserManagementController {

	constructor(@InjectRepository(User) private userRepository: UserRepository) { }

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
