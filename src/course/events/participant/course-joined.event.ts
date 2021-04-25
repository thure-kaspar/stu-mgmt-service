import { Event } from "..";
import { NotificationDto } from "../../../shared/dto/notification.dto";
import { CourseWithGroupSettings } from "../../models/course-with-group-settings.model";
import { Participant } from "../../models/participant.model";
import { INotify } from "../interfaces";

export class CourseJoined implements INotify {
	constructor(readonly course: CourseWithGroupSettings, readonly participant: Participant) {}

	toNotificationDto(): NotificationDto {
		return {
			event: Event.COURSE_JOINED,
			courseId: this.course.id,
			userId: this.participant.userId
		};
	}
}
