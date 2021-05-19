import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Config } from "../../.config/config";
import { Mail } from "../mail.model";
import { Settings } from "../settings";

const smtpConfig = Config.getMailing().smtp;
const settings: Settings = {
	host: process.env.SMTP_HOST || smtpConfig.host,
	port: (process.env.SMTP_PORT as any) || smtpConfig.port,
	secure: (process.env.SMTP_SECURE as any) || smtpConfig.useSecureConnection,
	auth: {
		user: process.env.SMTP_USERNAME || smtpConfig.username,
		pass: process.env.SMTP_PASSWORD || smtpConfig.password
	}
};

@Injectable()
export class NodemailerService {
	async send(mail: Mail): Promise<void> {
		const transporter = nodemailer.createTransport(settings);
		return transporter.sendMail(mail);
	}
}
