import { Injectable, Logger } from "@nestjs/common";
import { Mail } from "../mail.model";
import { NodemailerService } from "./nodemailer.service";

@Injectable()
export class MailingService {
	private logger = new Logger(MailingService.name);

	constructor(private nodemailer: NodemailerService) {}

	/**
	 * Tries to send the given `mail`.
	 * Errors will be caught and logged. In this case, this method returns `false`.
	 *
	 * @returns `true`, if mail was send without error.
	 */
	async send(mail: Mail): Promise<boolean> {
		try {
			await this.nodemailer.send(mail);
			return true;
		} catch (error) {
			this.logger.error("Failed to send mails:");
			console.error(error);
		}

		return false;
	}
}
