import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { UpdateService } from "../services/update.service";
import { UpdateMessage } from "../dto/update-message.dto";

@ApiTags("test")
@Controller('notifications')
export class NotificationsController {

	constructor(private updateService: UpdateService) { }

	@Post()
	sendNotification(@Body() message: UpdateMessage) {
		console.log("Send notification:", message);
		this.updateService.send(message);
	}

	@Post("retrieve")
	getNotification(@Body() message: UpdateMessage) {
		console.log("Retrieved message:", message);
	}
	
}
