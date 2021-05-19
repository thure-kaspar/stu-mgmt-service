export class Mail {
	readonly from = "no-reply@student-mgmt-system";
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
