import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { MailDto } from "../dto/mail.dto";
import { Settings } from "../settings";

@Injectable()
export class NodemailerService {
	async send(settings: Settings, mail: MailDto): Promise<any> {
		const transporter = nodemailer.createTransport(settings);
		return transporter.sendMail(mail);
	}
}
