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
		@InjectRepository(GroupEventRepository) private groupEvents: GroupEventRepository
	) {}

	handle(event: UserLeftGroupEvent): void {
		let att = 0;
		const MAX_ATTEMPTS = 2;
		const RETRY_TIMEOUT_SECONDS = 2;
		while (att <= MAX_ATTEMPTS) {
			let success = false;
			try {
				this.groupEvents.insert({
					event: UserLeftGroupEvent.name,
					groupId: event.groupId,
					userId: event.userId,
					payload: event.reason ? { reason: event.reason } : null
					});

			}
			catch (e) {
				if (e instanceof QueryFailedError) {
					if (att + 1 > MAX_ATTEMPTS) {
						throw e;
					}
				console.warn(`Query failed. Retrying in ${ RETRY_TIMEOUT_SECONDS } seconds (${ att + 1 }/${ MAX_ATTEMPTS })...`);
				Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, RETRY_TIMEOUT_SECONDS * 1000);
				} else {
					throw e;
				}
			}
			if (success) {
				return;
			}
			att += 1;
		}
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
