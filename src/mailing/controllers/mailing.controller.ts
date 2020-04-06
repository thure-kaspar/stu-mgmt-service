
import {Body, Controller, Post, ValidationPipe} from "@nestjs/common";
import {MailingService} from "../services/mailing.service";
import {MailDto} from "../dto/mail.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("mail")
@Controller("mail")
export class MailingController {

	constructor(private mailingService: MailingService) { }

	@Post("send")
	send(@Body(ValidationPipe) mailDto: MailDto): Promise<void> {
		return this.mailingService.send(mailDto);
	}

}
