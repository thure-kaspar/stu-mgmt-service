import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Event } from "..";
import { UserId } from "../../../shared/entities/user.entity";
import { AssignmentId } from "../../entities/assignment.entity";
import { CourseId } from "../../entities/course.entity";
import { NotificationService } from "../../services/notification.service";

export class UserUnregistered {
	constructor(
		readonly courseId: CourseId,
		readonly assignmentId: AssignmentId,
		readonly userId: UserId,
	) { }
}

@EventsHandler(UserUnregistered)
export class UserUnregisteredNotificationHandler implements IEventHandler<UserUnregistered> {

	constructor(private notifications: NotificationService) { }

	async handle(event: UserUnregistered): Promise<void> {
		this.notifications.send({
			event: Event.USER_REGISTERED,
			courseId: event.courseId,
			assignmentId: event.assignmentId,
			userId: event.userId
		});
	}

}
