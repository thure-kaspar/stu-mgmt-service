import { Controller, Get, HttpService, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { UpdateMessage } from "../../shared/dto/update-message.dto";
import { MESSAGES_ALL } from "../../../test/mocks/update-messages.mock";
import { UpdateMessageTestDto } from "../UpdateMessageTestDto";

@ApiTags("test")
@Controller("notifications")
export class NotificationsController {

	constructor(private http: HttpService) { }

	@Post()
	@ApiOperation({ description: "Sends the given UpdateMessage to the specified URL via HTTP-POST. Use (GET) /notifications for examples." })
	sendNotification(@Body() testMessage: UpdateMessageTestDto): void {
		console.log("Sending message to: " + testMessage.url);
		this.http.post(testMessage.url, testMessage.message).toPromise();
	} 

	@Post("log")
	@ApiOperation({summary: "Should not be called manually!" ,description: "Logs the received UpdateMessage send from (POST) /notifications, if it was send to this route (/notifications/log)." })
	logReceivedMessage(@Body() message: UpdateMessage): void {
		console.log(message);
	}

	@Get()
	@ApiOperation({ description: "Returns all possible UpdateMessages." })
	getNotification(): UpdateMessage[] {
		console.log("getNotifactions() was called");
		return MESSAGES_ALL;
	}
	
}
