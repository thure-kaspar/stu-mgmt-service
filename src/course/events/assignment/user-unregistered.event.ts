import { Event } from "../events";
import { NotificationDto } from "../../../shared/dto/notification.dto";
import { UserId } from "../../../shared/entities/user.entity";
import { AssignmentId } from "../../entities/assignment.entity";
import { CourseId } from "../../entities/course.entity";
import { INotify } from "../interfaces";

export class UserUnregistered implements INotify {
	constructor(
		readonly courseId: CourseId,
		readonly assignmentId: AssignmentId,
		readonly userId: UserId
	) {}
	toNotificationDto(): NotificationDto {
		return {
			event: Event.USER_REGISTERED,
			courseId: this.courseId,
			assignmentId: this.assignmentId,
			userId: this.userId
		};
	}
}
