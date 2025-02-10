import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Roles } from "../auth/decorators/roles.decorator";
import { NotificationDto } from "../shared/dto/notification.dto";
import { UserRole } from "../shared/enums";
import { NotificationService } from "./notification.service";
import { SubscriberDto } from "./subscriber/subscriber.dto";
import { SubscriberRepository } from "./subscriber/subscriber.repository";
import { Public } from "nest-keycloak-connect";
import { environment } from "src/.config/environment";

@ApiBearerAuth()
@ApiTags("notification")
@Roles(UserRole.SYSTEM_ADMIN, UserRole.MGMT_ADMIN, UserRole.ADMIN_TOOL)
@Controller("notifications")
// TODO: Is this supposed to always be accessible (@Public(true))
@Public(environment.is("development", "demo", "testing"))
export class NotificationController {
	constructor(
		private notificationService: NotificationService,
		private readonly subscriberRepository: SubscriberRepository
	) {}

	@ApiOperation({
		operationId: "notify",
		summary: "Simulate an event to notify subscribers.",
		description: "Notifies all subscribers using the given notification."
	})
	@Post("courses/:courseId/notify")
	notify(
		@Param("courseId") courseId: string,
		@Body() notification: NotificationDto
	): Promise<void> {
		notification.courseId = courseId;
		return this.notificationService.notifySubscribers(notification);
	}

	@Post("courses/:courseId/testNotify")
	testNotify(@Param("courseId") courseId: string, @Body() notification: NotificationDto): void {
		console.log("Received: ", notification);
	}

	@ApiOperation({
		operationId: "subscribe",
		summary: "Subscribe to events.",
		description: "Adds or updates a subscriber."
	})
	@Put("courses/:courseId/subscribers/:name")
	subscribe(
		@Param("courseId") courseId: string,
		@Param("name") name: string,
		@Body() subscriber: SubscriberDto
	): Promise<SubscriberDto> {
		subscriber.name = name;
		return this.subscriberRepository.addOrUpdate(courseId, subscriber);
	}

	@ApiOperation({
		operationId: "getSubscribers",
		summary: "Get subscribers.",
		description: "Retrieves all subscribers of a course."
	})
	@Get("courses/:courseId/subscribers")
	getSubscribers(@Param("courseId") courseId: string): Promise<SubscriberDto[]> {
		return this.subscriberRepository.getSubscribersOfCourse(courseId);
	}

	@ApiOperation({
		operationId: "unsubscribe",
		summary: "Unsubscribe.",
		description: "Removes the subscriber."
	})
	@Delete("courses/:courseId/subscribers/:name")
	unsubscribe(@Param("courseId") courseId: string, @Param("name") name: string): Promise<void> {
		return this.subscriberRepository.removeSubscriber(courseId, name);
	}
}
