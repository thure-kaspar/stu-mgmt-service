import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "..";
import { UserId } from "../../../shared/entities/user.entity";
import { CourseId } from "../../entities/course.entity";
import { GroupEvent } from "../../entities/group-event.entity";
import { GroupId } from "../../entities/group.entity";
import { GroupRepository } from "../../repositories/group.repository";
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

@EventsHandler(UserLeftGroupEvent)
export class CloseEmptyGroupsHandler implements IEventHandler<UserLeftGroupEvent> {
	private logger = new Logger(CloseEmptyGroupsHandler.name);
	constructor(@InjectRepository(GroupRepository) private groupRepository: GroupRepository) {}

	async handle(event: UserLeftGroupEvent): Promise<void> {
		const group = await this.groupRepository.getGroupWithUsers(event.groupId);

		if (group.userGroupRelations.length == 0) {
			await this.groupRepository.updateGroup(event.groupId, {
				isClosed: true
			});

			this.logger.debug(
				`Closed group ${group.name} (${group.id}) of course ${group.courseId}.`
			);
		}
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
