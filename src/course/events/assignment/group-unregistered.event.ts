import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { NotificationService } from "../../services/notification.service";
import { Event } from "..";
import { CourseId } from "../../entities/course.entity";
import { GroupId } from "../../entities/group.entity";
import { AssignmentId } from "../../entities/assignment.entity";

export class GroupUnregistered {
	constructor(
		readonly courseId: CourseId,
		readonly assignmentId: AssignmentId,
		readonly groupId: GroupId
	) {}
}

@EventsHandler(GroupUnregistered)
export class GroupUnregisteredNotificationHandler implements IEventHandler<GroupUnregistered> {
	constructor(private notifications: NotificationService) {}

	async handle(event: GroupUnregistered): Promise<void> {
		this.notifications.send({
			event: Event.GROUP_UNREGISTERED,
			courseId: event.courseId,
			assignmentId: event.assignmentId,
			groupId: event.groupId
		});
	}
}
