import { UserJoinedGroupHandler } from "./user-joined-group.event";
import { UserLeftGroupHandler, UserLeftGroupNotificationHandler } from "./user-left-group.event";
import { AssessmentScoreChangedHandler } from "./assessment-score-changed.event";

export const EventHandlers = [
	UserJoinedGroupHandler, 
	UserLeftGroupHandler, 
	UserLeftGroupNotificationHandler,
	AssessmentScoreChangedHandler
];
