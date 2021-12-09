import { AssignmentId } from "../../course/entities/assignment.entity";
import { CourseId } from "../../course/entities/course.entity";
import { GroupId } from "../../course/entities/group.entity";
import { Event } from "../../course/events/events";
import { UserId } from "../entities/user.entity";

export class NotificationDto {
	event: Event;
	courseId: CourseId;
	assignmentId?: AssignmentId;
	groupId?: GroupId;
	userId?: UserId;
	payload?: Record<string, unknown>;
}
