import { GroupEventDto } from "../../../src/course/dto/group/group-event.dto";
import { UserJoinedGroupEvent } from "../../../src/course/events/user-joined-group.event";
import { USER_STUDENT_JAVA, USER_STUDENT_2_JAVA, USER_STUDENT_3_JAVA_TUTOR } from "../users.mock";
import { UserLeftGroupEvent } from "../../../src/course/events/user-left-group.event";
import { GroupEvent } from "../../../src/course/entities/group-event.entity";
import { GROUP_1_JAVA } from "./groups.mock";

export const GROUP_EVENT_STUDENT_1_JOINED_GROUP: GroupEventDto = {
	event: UserJoinedGroupEvent.name,
	timestamp: new Date(2020, 1, 1),
	user: USER_STUDENT_JAVA,
	payload: null
};

export const GROUP_EVENT_TUTOR_JOINED_GROUP: GroupEventDto = {
	event: UserJoinedGroupEvent.name,
	timestamp: new Date(2020, 1, 2),
	user: USER_STUDENT_3_JAVA_TUTOR,
	payload: null
};

export const GROUP_EVENT_STUDENT_2_JOINED_GROUP: GroupEventDto = {
	event: UserJoinedGroupEvent.name,
	timestamp: new Date(2020, 1, 3),
	user: USER_STUDENT_2_JAVA,
	payload: null
};

export const GROUP_EVENT_TUTOR_LEFT_GROUP: GroupEventDto = {
	event: UserLeftGroupEvent.name,
	timestamp: new Date(2020, 1, 4),
	user: USER_STUDENT_2_JAVA,
	payload: { reason: "Kicked" }
};

export const GROUP_EVENTS_GROUP_1_MOCK: GroupEventDto[] = [
	GROUP_EVENT_STUDENT_1_JOINED_GROUP,
	GROUP_EVENT_TUTOR_JOINED_GROUP,
	GROUP_EVENT_STUDENT_2_JOINED_GROUP,
	GROUP_EVENT_TUTOR_LEFT_GROUP
];

export function getGroupEventEntities(): GroupEvent[] {
	const events: GroupEvent[] = GROUP_EVENTS_GROUP_1_MOCK.map(event => {
		const entity = new GroupEvent();
		entity.userId = event.user.id;
		entity.groupId = GROUP_1_JAVA.id;
		Object.assign(entity, event);
		return entity;
	});
	return events;
}
