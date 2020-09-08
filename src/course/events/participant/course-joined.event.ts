import { CourseWithGroupSettings } from "../../models/course-with-group-settings.model";
import { Participant } from "../../models/participant.model";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { NotificationService } from "../../services/notification.service";
import { Event } from "..";

export class CourseJoined {
	constructor(
		readonly course: CourseWithGroupSettings, 
		readonly participant: Participant
	) { }
}

@EventsHandler(CourseJoined)
export class CourseJoinedNotificationHandler implements IEventHandler<CourseJoined> {

	constructor(private notifications: NotificationService) { }

	async handle(event: CourseJoined): Promise<void> {
		this.notifications.send({
			event: Event.COURSE_JOINED,
			courseId: event.course.id,
			userId: event.participant.userId
		});
	}

}
