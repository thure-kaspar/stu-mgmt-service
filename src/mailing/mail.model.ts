import { Config } from "../.config/config";

export class Mail {
	readonly from = Config.get().mailing.from;
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
