import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Config } from "../../.config/config";
import { Mail } from "../mail.model";
import { Settings } from "../settings";

const smtpConfig = Config.get().mailing.smtp;
const settings: Settings = {
	host: smtpConfig.host,
	port: smtpConfig.port,
	secure: smtpConfig.useSecureConnection,
	auth: {
		user: smtpConfig.username,
		pass: smtpConfig.password
	}
};

@Injectable()
export class NodemailerService {
	async send(mail: Mail): Promise<void> {
		const transporter = nodemailer.createTransport(settings);
		await transporter.sendMail(mail);
	}
}
