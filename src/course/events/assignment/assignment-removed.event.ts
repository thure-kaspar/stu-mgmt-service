import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { AssignmentId } from "../../entities/assignment.entity";
import { CourseId } from "../../entities/course.entity";
import { NotificationService } from "../../services/notification.service";
import { Event } from "..";

export class AssignmentRemoved {
	constructor(
		readonly courseId: CourseId,
		readonly assignmentId: AssignmentId
	) { }
}

@EventsHandler(AssignmentRemoved)
export class AssignmentRemovedNotificationHandler implements IEventHandler<AssignmentRemoved> {

	constructor(private notifications: NotificationService) { }

	async handle(event: AssignmentRemoved): Promise<void> {
		this.notifications.send({
			event: Event.ASSIGNMENT_REMOVED,
			courseId: event.courseId,
			assignmentId: event.assignmentId
		});
	}

}
