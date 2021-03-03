import { ApiProperty } from "@nestjs/swagger";

// export const EventHandlers = [
// 	// EventHandlers that are used internally:
// 	CourseJoinedHandler_AutomaticGroupJoin,
// 	UserJoinedGroupHandler,
// 	UserLeftGroupHandler,
// 	AssessmentScoreChangedHandler,

// 	// EventHandlers that publish events to other systems:
// 	UserLeftGroupNotificationHandler,
// 	AssignmentCreatedNotificationHandler,
// 	AssignmentStateChangedNotificationHandler,
// 	GroupRegisteredNotificationHandler,
// 	GroupUnregisteredNotificationHandler,
// 	UserRegisteredNotificationHandler,
// 	UserUnregisteredNotificationHandler
// ];

export enum Event {
	COURSE_JOINED = "COURSE_JOINED",
	ASSIGNMENT_CREATED = "ASSIGNMENT_CREATED",
	ASSIGNMENT_REMOVED = "ASSIGNMENT_REMOVED",
	ASSIGNMENT_STATE_CHANGED = "ASSIGNMENT_STATE_CHANGED",
	GROUP_REGISTERED = "GROUP_REGISTERED",
	GROUP_UNREGISTERED = "GROUP_UNREGISTERED",
	USER_REGISTERED = "USER_REGISTERED",
	USER_UNREGISTERED = "USER_UNREGISTERED",
	USER_JOINED_GROUP = "USER_JOINED_GROUP",
	USER_LEFT_GROUP = "USER_LEFT_GROUP",
	REGISTRATIONS_CREATED = "REGISTRATIONS_CREATED",
	REGISTRATIONS_REMOVED = "REGISTRATIONS_REMOVED"
}

export class StudentMgmtEvent {
	@ApiProperty({ enum: Event })
	event: Event;
}
