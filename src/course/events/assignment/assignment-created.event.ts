import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { AssignmentId } from "../../entities/assignment.entity";
import { CourseId } from "../../entities/course.entity";
import { NotificationService } from "../../services/update.service";
import { Event } from "..";

export class AssignmentCreated {
	constructor(
		readonly courseId: CourseId,
		readonly assignmentId: AssignmentId
	) { }
}

@EventsHandler(AssignmentCreated)
export class AssignmentCreatedNotificationHandler implements IEventHandler<AssignmentCreated> {

	constructor(private notifications: NotificationService) { }

	async handle(event: AssignmentCreated): Promise<void> {
		this.notifications.send({
			event: Event.ASSIGNMENT_CREATED,
			courseId: event.courseId,
			assignmentId: event.assignmentId
		});
	}

}
