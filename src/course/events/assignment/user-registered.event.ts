import { Event } from "../events";
import { NotificationDto } from "../../../shared/dto/notification.dto";
import { UserId } from "../../../shared/entities/user.entity";
import { AssignmentId } from "../../entities/assignment.entity";
import { CourseId } from "../../entities/course.entity";
import { GroupId } from "../../entities/group.entity";
import { INotify } from "../interfaces";

export class UserRegistered implements INotify {
	constructor(
		readonly courseId: CourseId,
		readonly assignmentId: AssignmentId,
		readonly userId: UserId,
		readonly groupId: GroupId
	) {}

	toNotificationDto(): NotificationDto {
		return {
			event: Event.USER_REGISTERED,
			courseId: this.courseId,
			assignmentId: this.assignmentId,
			userId: this.userId,
			groupId: this.groupId
		};
	}
}
