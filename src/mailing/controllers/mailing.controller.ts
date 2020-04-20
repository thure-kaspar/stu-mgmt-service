
import {Body, Controller, Post } from "@nestjs/common";
import {MailingService} from "../services/mailing.service";
import {MailDto} from "../dto/mail.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("mail")
@Controller("mail")
export class MailingController {

	constructor(private mailingService: MailingService) { }

	@Post("send")
	@ApiOperation({
		operationId: "send",
		summary: "Send mail",
		description: "Sends the mail."
	})
	send(@Body() mailDto: MailDto): Promise<void> {
		return this.mailingService.send(mailDto);
	}

}
