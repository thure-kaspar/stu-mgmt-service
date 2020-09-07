import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Event } from "..";
import { AssignmentId } from "../../entities/assignment.entity";
import { CourseId } from "../../entities/course.entity";
import { NotificationService } from "../../services/notification.service";

export class RegistrationsCreated {
	constructor(
		readonly courseId: CourseId,
		readonly assignmentId: AssignmentId
	) { }
}

@EventsHandler(RegistrationsCreated)
export class RegistrationsCreatedNotificationHandler implements IEventHandler<RegistrationsCreated> {

	constructor(private notifications: NotificationService) { }

	async handle(event: RegistrationsCreated): Promise<void> {
		this.notifications.send({
			event: Event.REGISTRATIONS_REMOVED,
			courseId: event.courseId,
			assignmentId: event.assignmentId,
		});
	}

}
