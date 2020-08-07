import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { GroupEvent } from "../entities/group-event.entity";
import { Repository } from "typeorm";
import { UpdateService } from "../services/update.service";
import { Course } from "../entities/course.entity";
import { CourseRepository } from "../repositories/course.repository";
import { AffectedObject, EventType } from "../../shared/dto/update-message.dto";
import { GroupId } from "../entities/group.entity";

export class UserLeftGroupEvent {
	constructor(
		public readonly groupId: GroupId,
		public readonly userId: string, 
		public readonly reason?: string
	) { }
}

@EventsHandler(UserLeftGroupEvent)
export class UserLeftGroupHandler implements IEventHandler<UserLeftGroupEvent> {

	constructor(@InjectRepository(GroupEvent) private groupEvents: Repository<GroupEvent>) { }
	
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

	constructor(private updateService: UpdateService,
				@InjectRepository(Course) private courseRepo: CourseRepository) { }

	async handle(event: UserLeftGroupEvent): Promise<void> {

		const course = await this.courseRepo.createQueryBuilder("course")
			.innerJoin("course.groups", "group", "group.id = :groupId", { groupId: event.groupId })
			.innerJoinAndSelect("course.config", "config")
			.getOne();

		if (course?.config?.subscriptionUrl) {
			this.updateService.send(course.config.subscriptionUrl, {
				affectedObject: AffectedObject.USER_GROUP_RELATION,
				type: EventType.REMOVE,
				courseId: course.id,
				entityId: event.userId,
				entityId_relation: event.groupId,
				date: new Date()
			});
		}
	}
	
}
