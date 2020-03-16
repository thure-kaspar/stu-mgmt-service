import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent } from "typeorm";
import { CourseUserRelation } from "../../../shared/entities/course-user-relation.entity";
import { AffectedObject, EventType, UpdateMessageDto } from "../../../task/tasks/update.service";
import { UpdateMessage } from "../../../task/database/entities/update-message.entity";

@EventSubscriber()
export class CourseUserRelationSubscriber implements EntitySubscriberInterface<CourseUserRelation> {

	constructor() { }

	listenTo() {
		// Indicates that this subscriber only listens to CourseUserRelation events
		return CourseUserRelation;
	}

	afterInsert(event: InsertEvent<CourseUserRelation>) {
		event.manager.getRepository(UpdateMessage).insert(
			this.createMessage(EventType.INSERT, event.entity)
		);
	}

	afterUpdate(event: UpdateEvent<CourseUserRelation>) {
		event.manager.getRepository(UpdateMessage).insert(
			this.createMessage(EventType.UPDATE, event.entity)
		);
	}

	afterRemove(event: RemoveEvent<CourseUserRelation>) {
		event.manager.getRepository(UpdateMessage).insert(
			this.createMessage(EventType.REMOVE, event.entity)
		);
	}

	private createMessage(type: EventType, entity: CourseUserRelation): UpdateMessageDto {
		return {
			type: type,
			affectedObject: AffectedObject.COURSE_USER_RELATION,
			courseId: entity.courseId,
			entityId: entity.courseId,
			entityId_relation: entity.userId
		};
	}
}