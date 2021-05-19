import { Language } from "../../src/shared/language";
import { UserSettingsDto } from "../../src/user/dto/user-settings.dto";
import {
	USER_MGMT_ADMIN_JAVA_LECTURER,
	USER_STUDENT_2_JAVA,
	USER_STUDENT_JAVA
} from "./users.mock";

export const USER_1_USER_SETTINGS: UserSettingsDto = {
	language: Language.DE,
	allowEmails: true
};

export const USER_2_USER_SETTINGS: UserSettingsDto = {
	language: Language.EN,
	allowEmails: true,
	blacklistedEvents: {
		ASSIGNMENT_STATE_CHANGED: true
	}
};

export const USER_MGMT_ADMIN_SETTINGS: UserSettingsDto = {
	allowEmails: false,
	language: Language.DE
};

export const USER_SETTINGS_MOCK: { userId: string; userSettings: UserSettingsDto }[] = [
	{ userId: USER_STUDENT_JAVA.id, userSettings: USER_1_USER_SETTINGS },
	{ userId: USER_STUDENT_2_JAVA.id, userSettings: USER_2_USER_SETTINGS },
	{ userId: USER_MGMT_ADMIN_JAVA_LECTURER.id, userSettings: USER_MGMT_ADMIN_SETTINGS }
];
