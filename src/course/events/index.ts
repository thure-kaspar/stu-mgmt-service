import { ApiProperty } from "@nestjs/swagger";
import { AssessmentScoreChangedHandler } from "./assessment/assessment-score-changed.event";
import { AssignmentCreatedNotificationHandler } from "./assignment/assignment-created.event";
import { AssignmentStateChangedNotificationHandler } from "./assignment/assignment-state-changed.event";
import { GroupRegisteredNotificationHandler } from "./assignment/group-registered.event";
import { GroupUnregisteredNotificationHandler } from "./assignment/group-unregistered.event";
import { UserRegisteredNotificationHandler } from "./assignment/user-registered.event";
import { UserUnregisteredNotificationHandler } from "./assignment/user-unregistered.event";
import { UserJoinedGroupHandler } from "./group/user-joined-group.event";
import { UserLeftGroupHandler, UserLeftGroupNotificationHandler } from "./group/user-left-group.event";

/** EventHandlers that are used internally. */
export const EventHandlers = [
	UserJoinedGroupHandler, 
	UserLeftGroupHandler, 
	AssessmentScoreChangedHandler,
];

/** EventHandlers that publish events to other systems. */
export const EventNotificationHandlers = [
	UserLeftGroupNotificationHandler,
	AssignmentCreatedNotificationHandler,
	AssignmentStateChangedNotificationHandler,
	GroupRegisteredNotificationHandler,
	GroupUnregisteredNotificationHandler,
	UserRegisteredNotificationHandler,
	UserUnregisteredNotificationHandler
];

export enum Event {
	ASSIGNMENT_CREATED = "ASSIGNMENT_CREATED",
	ASSIGNMENT_REMOVED = "ASSIGNMENT_REMOVED",
	ASSIGNMENT_STATE_CHANGED = "ASSIGNMENT_STATE_CHANGED",
	GROUP_REGISTERED = "GROUP_REGISTERED",
	GROUP_UNREGISTERED = "GROUP_UNREGISTERED",
	USER_REGISTERED = "USER_REGISTERED",
	USER_UNREGISTERED = "USER_UNREGISTERED",
	USER_JOINED_GROUP = "USER_JOINED_GROUP",
	USER_LEFT_GROUP = "USER_LEFT_GROUP",
}

export class StudentMgmtEvent {
	@ApiProperty({ enum: Event })
	event: Event;
}
