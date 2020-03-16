import { Controller, Post, Body, Param, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { UpdateMessageDto } from "../../task/tasks/update.service";
import { MESSAGES_ALL } from "../../../test/mocks/update-messages.mock";

@ApiTags("test")
@Controller("notifications")
export class NotificationsController {

	constructor() { }

	@ApiOperation({ description: "Sends all possible UpdateMessages." })
	@Get()
	getNotification(): UpdateMessageDto[] {
		return MESSAGES_ALL;
	}
	
}
