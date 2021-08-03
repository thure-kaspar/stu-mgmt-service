import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Event } from "..";
import { NotificationDto } from "../../../shared/dto/notification.dto";
import { UserId } from "../../../shared/entities/user.entity";
import { CourseId } from "../../entities/course.entity";
import { GroupId } from "../../entities/group.entity";
import { GroupEventRepository } from "../../repositories/group-event.repository";
import { INotify } from "../interfaces";

export class UserJoinedGroupEvent implements INotify {
	constructor(
		public readonly courseId: CourseId,
		public readonly groupId: GroupId,
		public readonly userId: UserId
	) {}

	toNotificationDto(): NotificationDto {
		return {
			event: Event.USER_JOINED_GROUP,
			courseId: this.courseId,
			userId: this.userId,
			groupId: this.groupId
		};
	}
}

@EventsHandler(UserJoinedGroupEvent)
export class UserJoinedGroupHandler implements IEventHandler<UserJoinedGroupEvent> {
	constructor(
		@InjectRepository(GroupEventRepository) private groupEvents: GroupEventRepository
	) {}

	handle(event: UserJoinedGroupEvent): void {
		this.groupEvents.insert({ ...event, event: UserJoinedGroupEvent.name });
	}
}
