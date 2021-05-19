import { Injectable } from "@nestjs/common";
import { Mail } from "../mail.model";
import { NodemailerService } from "./nodemailer.service";

@Injectable()
export class MailingService {
	constructor(private nodemailer: NodemailerService) {}

	async send(mail: Mail): Promise<void> {
		return this.nodemailer.send(mail);
	}
}
