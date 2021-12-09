import { Settings } from "../../src/mailing/settings";
import { Mail } from "../../src/mailing/mail.model";
import { Logger } from "@nestjs/common";

/**
 * Replaces the NodemailerService to disable mailing.
 */
export class DisabledMailing {
	private readonly logger = new Logger("DisabledMailing");

	async send(settings: Settings, mail: Mail): Promise<void> {
		this.logger.verbose("[disabled]: Sending mail to: " + mail.to);
		return; // Do nothing
	}
}
