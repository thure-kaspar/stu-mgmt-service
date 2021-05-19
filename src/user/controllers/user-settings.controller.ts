import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { UserSettingsDto } from "../dto/user-settings.dto";
import { IdentityGuard } from "../guards/identity.guard";
import { UserSettingsService } from "../services/user-settings.service";

@ApiBearerAuth()
@ApiTags("user")
@UseGuards(AuthGuard)
@Controller("users/:userId/settings")
export class UserSettingsController {
	constructor(private userSettingsService: UserSettingsService) {}

	@Put()
	@ApiOperation({
		operationId: "updateSettings",
		summary: "Update settings.",
		description: "Updates the settings of a user."
	})
	@UseGuards(IdentityGuard)
	updateSettings(
		@Param("userId") userId: string,
		@Body() userSettings: UserSettingsDto
	): Promise<UserSettingsDto> {
		return this.userSettingsService.updateSettings(userId, userSettings);
	}

	@ApiOperation({
		operationId: "getSettings",
		summary: "Get settings.",
		description: "Returns the settings of a user."
	})
	@Get()
	@UseGuards(IdentityGuard)
	getSettings(@Param("userId") userId: string): Promise<UserSettingsDto> {
		return this.userSettingsService.getByUserId(userId);
	}
}
