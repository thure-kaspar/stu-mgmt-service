import { Injectable } from "@nestjs/common";
import { MailDto } from "../dto/mail.dto";
import * as config from "config";
import { InjectRepository } from "@nestjs/typeorm";
import { MailTemplateRepository } from "../repositories/mail-template.repository";
import { MailTemplate } from "../entities/mail-template.entity";
import { NodemailerService } from "./nodemailer.service";
import { Settings } from "../settings";

const smtpConfig = config.get("smtp");
const settings: Settings = {
	host: process.env.SMTP_SERVER || smtpConfig.server,
	port: process.env.SMTP_PORT || smtpConfig.port,
	secure: process.env.SMTP_SECURE || smtpConfig.useSecureConnection,
	auth: {
		user: process.env.SMTP_USERNAME || smtpConfig.username,
		pass: process.env.SMTP_PASSWORD || smtpConfig.password,
	}
};

@Injectable()
export class MailingService {

	constructor(@InjectRepository(MailTemplate) private templateRepo: MailTemplateRepository,
				private nodemailer: NodemailerService) { }

	async send(mail: MailDto): Promise<void> {
		// Pass to Nodemailer and transfer it to recipient
		return this.nodemailer.send(settings, mail);
	}

	async sendFromTemplate(to: string, mailTemplateKey: string, placeholders: Map<string, string>): Promise<void> {
		// Get the template
		const template = await this.templateRepo.getMailTemplateByKey(mailTemplateKey);
		let { subject, text, html } = template;

		// Replace all occurences of placeholders in subject, text and html
		placeholders.forEach((value, key) => {
			subject = subject.split(`$$${key}$$`).join(value);
			text = text.split(`$$${key}$$`).join(value);
			html = html.split(`$$${key}$$`).join(value);
		});

		// Send the mail
		const mail: MailDto = { from: settings.auth.user, to, subject, text, html };
		this.send(mail);
	}

}
