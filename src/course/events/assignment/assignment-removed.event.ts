import { Event } from "../events";
import { NotificationDto } from "../../../shared/dto/notification.dto";
import { AssignmentId } from "../../entities/assignment.entity";
import { CourseId } from "../../entities/course.entity";
import { INotify } from "../interfaces";

export class AssignmentRemoved implements INotify {
	constructor(readonly courseId: CourseId, readonly assignmentId: AssignmentId) {}

	toNotificationDto(): NotificationDto {
		return {
			event: Event.ASSIGNMENT_REMOVED,
			courseId: this.courseId,
			assignmentId: this.assignmentId
		};
	}
}
