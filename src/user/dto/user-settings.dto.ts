import { Event } from "../../course/events";
import { Language } from "../../shared/language";

type BlacklistedEvents = { [key in Event]?: boolean };

export class UserSettingsDto {
	language: Language;
	allowEmails: boolean;
	blacklistedEvents?: BlacklistedEvents;
}
