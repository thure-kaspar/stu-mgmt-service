import { IsNotEmpty } from "class-validator";

export class MailTemplateDto {
	id?: number;

	@IsNotEmpty()
	key: string;

	@IsNotEmpty()
	subject: string;

	text: string;

	html: string;
}
