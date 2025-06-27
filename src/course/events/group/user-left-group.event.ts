import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Event } from "../events";
import { NotificationDto } from "../../../shared/dto/notification.dto";
import { UserId } from "../../../shared/entities/user.entity";
import { CourseId } from "../../entities/course.entity";
import { GroupId } from "../../entities/group.entity";
import { GroupEventRepository } from "../../repositories/group-event.repository";
import { GroupRepository } from "../../repositories/group.repository";
import { INotify } from "../interfaces";
import { QueryFailedError } from "typeorm";

export class UserLeftGroupEvent implements INotify {
	constructor(
		public readonly courseId: CourseId,
		public readonly groupId: GroupId,
		public readonly userId: UserId,
		public readonly reason?: string
	) {}

	toNotificationDto(): NotificationDto {
		return {
			event: Event.USER_LEFT_GROUP,
			courseId: this.courseId,
			userId: this.userId,
			groupId: this.groupId
		};
	}
}

@EventsHandler(UserLeftGroupEvent)
export class UserLeftGroupHandler implements IEventHandler<UserLeftGroupEvent> {
	constructor(
		private readonly groupEvents: GroupEventRepository
	) {}

	async handle(event: UserLeftGroupEvent): Promise<void> {
		await this.groupEvents.insert({
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
