import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Event } from "..";
import { UserId } from "../../../shared/entities/user.entity";
import { AssignmentId } from "../../entities/assignment.entity";
import { CourseId } from "../../entities/course.entity";
import { NotificationService } from "../../services/update.service";
import { GroupId } from "../../entities/group.entity";

export class UserRegistered {
	constructor(
		readonly courseId: CourseId,
		readonly assignmentId: AssignmentId,
		readonly userId: UserId,
		readonly groupId: GroupId,
	) { }
}

@EventsHandler(UserRegistered)
export class UserRegisteredNotificationHandler implements IEventHandler<UserRegistered> {

	constructor(private notifications: NotificationService) { }

	async handle(event: UserRegistered): Promise<void> {
		this.notifications.send({
			event: Event.USER_REGISTERED,
			courseId: event.courseId,
			assignmentId: event.assignmentId,
			userId: event.userId
		});
	}

}
