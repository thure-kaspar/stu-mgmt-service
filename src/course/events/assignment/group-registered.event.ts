import { Event } from "..";
import { NotificationDto } from "../../../shared/dto/notification.dto";
import { AssignmentId } from "../../entities/assignment.entity";
import { CourseId } from "../../entities/course.entity";
import { GroupId } from "../../entities/group.entity";
import { INotify } from "../interfaces";

export class GroupRegistered implements INotify {
	constructor(
		readonly courseId: CourseId,
		readonly assignmentId: AssignmentId,
		readonly groupId: GroupId
	) {}

	toNotificationDto(): NotificationDto {
		return {
			event: Event.GROUP_REGISTERED,
			courseId: this.courseId,
			assignmentId: this.assignmentId,
			groupId: this.groupId
		};
	}
}
