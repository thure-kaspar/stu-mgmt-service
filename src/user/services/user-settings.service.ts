import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserSettingsDto } from "../dto/user-settings.dto";
import { UserSettings } from "../entities/user-settings.entity";

@Injectable()
export class UserSettingsService {
	constructor(
		@InjectRepository(UserSettings) private userSettingsRepository: Repository<UserSettings>
	) {}

	/**
	 * Update the settings of a user and returns them.
	 */
	async updateSettings(userId: string, userSettings: UserSettingsDto): Promise<UserSettingsDto> {
		await this.userSettingsRepository.update(userId, userSettings);
		return this.getByUserId(userId);
	}

	/**
	 * Returns the `UserSettings` of a user.
	 */
	async getByUserId(userId: string): Promise<UserSettingsDto> {
		const userSettings = await this.userSettingsRepository.findOne({
			where: { userId }
		});
		return userSettings.toDto();
	}
}
