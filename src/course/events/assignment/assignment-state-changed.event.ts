import { Event } from "../events";
import { NotificationDto } from "../../../shared/dto/notification.dto";
import { Assignment } from "../../models/assignment.model";
import { INotify } from "../interfaces";

export class AssignmentStateChanged implements INotify {
	constructor(readonly assignment: Assignment) {}

	toNotificationDto(): NotificationDto {
		return {
			event: Event.ASSIGNMENT_STATE_CHANGED,
			courseId: this.assignment.courseId,
			assignmentId: this.assignment.id,
			payload: {
				state: this.assignment.state
			}
		};
	}
}
