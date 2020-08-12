import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Event } from "..";
import { NotificationService } from "../../services/notification.service";
import { Assignment } from "../../models/assignment.model";

export class AssignmentStateChanged {
	constructor(
		readonly assignment: Assignment
	) { }
}

@EventsHandler(AssignmentStateChanged)
export class AssignmentStateChangedNotificationHandler implements IEventHandler<AssignmentStateChanged> {

	private logger = new Logger(AssignmentStateChangedNotificationHandler.name);

	constructor(private notifications: NotificationService) { }

	async handle(event: AssignmentStateChanged): Promise<void> {
		this.logger.verbose(`Assignment (${event.assignment.id}) changed to ${event.assignment.state}.`);

		this.notifications.send({
			event: Event.ASSIGNMENT_STATE_CHANGED,
			courseId: event.assignment.courseId,
			assignmentId: event.assignment.id
		});
	}

}
