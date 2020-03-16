import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent } from "typeorm";
import { Assignment } from "../../../shared/entities/assignment.entity";
import { EventType, AffectedObject, UpdateService, UpdateMessage } from "../../services/update.service";

@EventSubscriber()
export class AssignmentSubscriber implements EntitySubscriberInterface<Assignment> {

	private updateService: UpdateService;

	constructor() { 
		this.updateService = new UpdateService();
	}

	listenTo() {
		// Indicates that this subscriber only listens to Assignment events
		return Assignment;
	}

	afterInsert(event: InsertEvent<Assignment>): void {
		this.updateService.send(
			this.createMessage(EventType.INSERT, event.entity)
		);
	}

	afterUpdate(event: UpdateEvent<Assignment>): void {
		this.updateService.send(
			this.createMessage(EventType.UPDATE, event.entity)
		);
	}

	afterRemove(event: RemoveEvent<Assignment>): void { // TODO: Fix: id is undefined after delete :(
		this.updateService.send(
			this.createMessage(EventType.REMOVE, event.entity)
		);
	}

	private createMessage(type: EventType, entity: Assignment): UpdateMessage {
		return {
			type: type,
			affectedObject: AffectedObject.ASSIGNMENT,
			courseId: entity.courseId,
			entityId: entity.id
		};
	}
}
