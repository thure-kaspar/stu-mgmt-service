import { MigrationInterface, QueryRunner } from "typeorm";
import { User } from "../src/shared/entities/user.entity";
import { Language } from "../src/shared/language";
import { UserSettings } from "../src/user/entities/user-settings.entity";

export class UpdateUserSettings1629826169063 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		console.log("Running migration: UpdateUserSettings1629826169063");

		const userRepository = queryRunner.manager.getRepository<User>("User");
		const userSettingsRepository =
			queryRunner.manager.getRepository<UserSettings>("UserSettings");

		const users = await userRepository.find();

		const userSettings = users.map(user => this.createDefaultUserSettings(user));

		await userSettingsRepository.insert(userSettings);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.clearTable("user_settings");
	}

	private createDefaultUserSettings(user: User) {
		const settings = new UserSettings();
		settings.userId = user.id;
		settings.allowEmails = true;
		settings.language = Language.DE;
		settings.blacklistedEvents = null;
		return settings;
	}
}
