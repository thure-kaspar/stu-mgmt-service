import { Controller, Get, HttpService, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { NotificationDto } from "../../shared/dto/notification.dto";

@ApiTags("test")
@Controller("notifications")
export class NotificationsController {
	constructor(private http: HttpService) {}
	// TODO: Add new examples
	@Post()
	@ApiOperation({
		operationId: "sendNotification",
		summary: "Send notication.",
		description:
			"Sends the given UpdateMessage to the specified URL via HTTP-POST. Use (GET) /notifications for examples."
	})
	sendNotification(@Body() testMessage: NotificationDto): void {
		// console.log("Sending message to: " + testMessage.url);
		// this.http.post(testMessage.url, testMessage.message).toPromise();
	}

	@Post("log")
	@ApiOperation({
		operationId: "logReceivedMessage",
		summary: "SHOULD NOT BE CALLED.",
		description:
			"Logs the received UpdateMessage send from (POST) /notifications, if it was send to this route (/notifications/log)."
	})
	logReceivedMessage(@Body() message: any): void {
		console.log(message);
	}

	@Get()
	@ApiOperation({
		operationId: "getNotification",
		summary: "Get UpdateMessage-Examples.",
		description: "Returns all possible UpdateMessages."
	})
	getNotification(): any[] {
		console.log("getNotifactions() was called");
		return null;
	}
}
