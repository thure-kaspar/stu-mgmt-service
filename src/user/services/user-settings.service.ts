import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserSettingsDto } from "../dto/user-settings.dto";
import { UserSettings } from "../entities/user-settings.entity";
import { UserSettingsRepository } from "../repositories/user-settings.repository";

@Injectable()
export class UserSettingsService {
	constructor(
		private readonly userSettingsRepository: UserSettingsRepository
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
		if (userSettings === null) {
			return new UserSettings().toDto()
		} else {
			return userSettings.toDto();
		}
	}
}
