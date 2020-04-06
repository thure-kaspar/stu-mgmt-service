import { Settings } from "../../src/mailing/settings";
import { MailDto } from "../../src/mailing/dto/mail.dto";
import { Logger } from "@nestjs/common";

/**
 * Replaces the NodemailerService to disable mailing.
 */
export class DisabledMailing {
	private readonly logger = new Logger("DisabledMailing");

	async send(settings: Settings, mail: MailDto): Promise<any> {
		this.logger.verbose("[disabled]: Sending mail to: " + mail.to);
		return; // Do nothing
	}
}
