import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { UpdateMessage } from "../../course/services/update.service";
import { MESSAGES_ALL } from "../../../test/mocks/update-messages.mock";

@ApiTags("test")
@Controller("notifications")
export class NotificationsController {

	constructor() { }

	@ApiOperation({ description: "Sends all possible UpdateMessages." })
	@Get()
	getNotification(): UpdateMessage[] {
		console.log("getNotifactions() was called");
		return MESSAGES_ALL;
	}
	
}
