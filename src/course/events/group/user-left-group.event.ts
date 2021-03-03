import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "..";
import { UserId } from "../../../shared/entities/user.entity";
import { CourseId } from "../../entities/course.entity";
import { GroupEvent } from "../../entities/group-event.entity";
import { GroupId } from "../../entities/group.entity";
import { NotificationService } from "../../services/notification.service";

export class UserLeftGroupEvent {
	constructor(
		public readonly courseId: CourseId,
		public readonly groupId: GroupId,
		public readonly userId: UserId,
		public readonly reason?: string
	) {}
}

@EventsHandler(UserLeftGroupEvent)
export class UserLeftGroupHandler implements IEventHandler<UserLeftGroupEvent> {
	constructor(@InjectRepository(GroupEvent) private groupEvents: Repository<GroupEvent>) {}

	handle(event: UserLeftGroupEvent): void {
		this.groupEvents.insert({
			event: UserLeftGroupEvent.name,
			groupId: event.groupId,
			userId: event.userId,
			payload: event.reason ? { reason: event.reason } : null
		});
	}
}

/** Triggers the transmission of UpdateMessages for subscribed courses. */
@EventsHandler(UserLeftGroupEvent)
export class UserLeftGroupNotificationHandler implements IEventHandler<UserLeftGroupEvent> {
	constructor(private notifications: NotificationService) {}

	async handle(event: UserLeftGroupEvent): Promise<void> {
		this.notifications.send({
			event: Event.USER_LEFT_GROUP,
			courseId: event.courseId,
			userId: event.userId,
			groupId: event.groupId
		});
	}
}
