import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { GroupEvent } from "../../entities/group-event.entity";
import { Repository } from "typeorm";
import { GroupId } from "../../entities/group.entity";
import { UserId } from "../../../shared/entities/user.entity";
import { NotificationService } from "../../services/notification.service";
import { UserLeftGroupEvent } from "./user-left-group.event";
import { Event } from "..";

export class UserJoinedGroupEvent {
	constructor(
		public readonly groupId: GroupId,
		public readonly userId: UserId
	) { }
}

@EventsHandler(UserJoinedGroupEvent)
export class UserJoinedGroupHandler implements IEventHandler<UserJoinedGroupEvent> {

	constructor(@InjectRepository(GroupEvent) private groupEvents: Repository<GroupEvent>) { }

	handle(event: UserJoinedGroupEvent): void {
		this.groupEvents.insert({...event, event: UserJoinedGroupEvent.name });
	}
	
}

@EventsHandler(UserJoinedGroupEvent)
export class UserJoinedGroupNotificationHandler implements IEventHandler<UserJoinedGroupEvent> {

	constructor(private notifications: NotificationService) { }

	async handle(event: UserLeftGroupEvent): Promise<void> {
		this.notifications.send({
			event: Event.USER_JOINED_GROUP,
			courseId: event.courseId,
			userId: event.userId,
			groupId: event.groupId
		});
	}
	
}
