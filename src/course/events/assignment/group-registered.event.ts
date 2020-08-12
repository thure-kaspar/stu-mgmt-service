import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { NotificationService } from "../../services/notification.service";
import { Event } from "..";
import { CourseId } from "../../entities/course.entity";
import { GroupId } from "../../entities/group.entity";
import { AssignmentId } from "../../entities/assignment.entity";

export class GroupRegistered {
	constructor(
		readonly courseId: CourseId,
		readonly assignmentId: AssignmentId,
		readonly groupId: GroupId
	) { }
}

@EventsHandler(GroupRegistered)
export class GroupRegisteredNotificationHandler implements IEventHandler<GroupRegistered> {

	constructor(private notifications: NotificationService) { }

	async handle(event: GroupRegistered): Promise<void> {
		this.notifications.send({
			event: Event.GROUP_REGISTERED,
			courseId: event.courseId,
			assignmentId: event.assignmentId,
			groupId: event.groupId
		});
	}

}
