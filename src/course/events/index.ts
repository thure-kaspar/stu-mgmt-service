import { UserJoinedGroupHandler } from "./user-joined-group.event";
import { UserLeftGroupHandler, UserLeftGroupNotificationHandler } from "./user-left-group.event";

export const EventHandlers = [UserJoinedGroupHandler, UserLeftGroupHandler, UserLeftGroupNotificationHandler];
