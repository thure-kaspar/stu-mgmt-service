import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent } from "typeorm";
import { Assignment } from "../../../shared/entities/assignment.entity";
import { EventType, AffectedObject, UpdateMessageDto } from "../../../task/tasks/update.service";
import { UpdateMessage } from "../../../task/database/entities/update-message.entity";

@EventSubscriber()
export class AssignmentSubscriber implements EntitySubscriberInterface<Assignment> {

	constructor() { }

	listenTo() {
		// Indicates that this subscriber only listens to Assignment events
		return Assignment;
	}

	afterInsert(event: InsertEvent<Assignment>): void {
		event.manager.getRepository(UpdateMessage).insert(
			this.createMessage(EventType.INSERT, event.entity)
		);
	}

	afterUpdate(event: UpdateEvent<Assignment>): void {
		event.manager.getRepository(UpdateMessage).insert(
			this.createMessage(EventType.UPDATE, event.entity)
		);
	}

	afterRemove(event: RemoveEvent<Assignment>): void { // TODO: Fix: id is undefined after delete :(
		event.manager.getRepository(UpdateMessage).insert(
			this.createMessage(EventType.REMOVE, event.entity)
		);
	}

	private createMessage(type: EventType, entity: Assignment): UpdateMessageDto {
		return {
			type: type,
			affectedObject: AffectedObject.ASSIGNMENT,
			courseId: entity.courseId,
			entityId: entity.id
		};
	}
}