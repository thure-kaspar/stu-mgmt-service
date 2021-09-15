import { Injectable, Logger } from "@nestjs/common";
import { Mail } from "../mail.model";
import { NodemailerService } from "./nodemailer.service";

@Injectable()
export class MailingService {
	private logger = new Logger(MailingService.name);

	constructor(private nodemailer: NodemailerService) {}

	async send(mail: Mail): Promise<void> {
		try {
			await this.nodemailer.send(mail);
		} catch (error) {
			this.logger.error("Failed to send mails:");
			console.log(error);
		}
	}
}
