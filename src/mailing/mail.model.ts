import { env } from "../.config/environment";

export class Mail {
	readonly from = env("MAIL_FROM");
	to?: string[];
	cc?: string[];
	bcc?: string[];
	subject: string;
	text: string;
	html: string;

	constructor(bcc: string[]) {
		this.bcc = bcc;
	}
}
