import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Config } from "../../.config/config";
import { Mail } from "../mail.model";
import { Settings } from "../settings";

const { host, port, useSecureConnection, username, password } = Config.get().mailing.smtp || {};
const settings: Settings = {
	host: host,
	port: port,
	secure: useSecureConnection,
	auth: {
		user: username,
		pass: password
	}
};

@Injectable()
export class NodemailerService {
	async send(mail: Mail): Promise<void> {
		const transporter = nodemailer.createTransport(settings);
		await transporter.sendMail(mail);
	}
}
