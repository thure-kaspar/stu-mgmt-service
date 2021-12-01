import { Event } from "../events";
import { NotificationDto } from "../../../shared/dto/notification.dto";
import { INotify } from "../interfaces";

export class AssignmentUpdated implements INotify {
	constructor(readonly courseId: string, readonly assignmentId: string) {}

	toNotificationDto(): NotificationDto {
		return {
			event: Event.ASSIGNMENT_UPDATED,
			courseId: this.courseId,
			assignmentId: this.assignmentId
		};
	}
}
