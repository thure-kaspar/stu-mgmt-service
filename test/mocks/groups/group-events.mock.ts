import { GroupEventDto } from "../../../src/course/dto/group/group-event.dto";
import { UserJoinedGroupEvent } from "../../../src/course/events/user-joined-group.event";
import { USER_STUDENT_JAVA, USER_STUDENT_2_JAVA, USER_STUDENT_3_JAVA_TUTOR, USER_ELSHAR, USER_KUNOLD } from "../users.mock";
import { UserLeftGroupEvent } from "../../../src/course/events/user-left-group.event";
import { GroupEvent } from "../../../src/course/entities/group-event.entity";
import { GROUP_1_JAVA, GROUP_2_JAVA, GROUP_3_JAVA2020 } from "./groups.mock";

export const GROUP_EVENT_TUTOR_JOINED_GROUP: GroupEventDto = {
	event: UserJoinedGroupEvent.name,
	timestamp: new Date(2020, 1, 2),
	userId: USER_STUDENT_3_JAVA_TUTOR.id,
	groupId: GROUP_1_JAVA.id,
	payload: null
};

export const GROUP_EVENT_STUDENT_2_JOINED_GROUP: GroupEventDto = {
	event: UserJoinedGroupEvent.name,
	timestamp: new Date(2020, 1, 3),
	userId: USER_STUDENT_2_JAVA.id,
	groupId: GROUP_1_JAVA.id,
	payload: null
};

export const GROUP_EVENT_TUTOR_LEFT_GROUP: GroupEventDto = {
	event: UserLeftGroupEvent.name,
	timestamp: new Date(2020, 1, 4),
	userId: USER_STUDENT_2_JAVA.id,
	groupId: GROUP_1_JAVA.id,
	payload: { reason: "Kicked" }
};

export const GROUP_EVENT_ELSHAR_JOINED_JAVA_2020: GroupEventDto = {
	event: UserJoinedGroupEvent.name,
	timestamp: new Date(2020, 1, 1),
	userId: USER_ELSHAR.id,
	groupId: GROUP_3_JAVA2020.id
};

export const GROUP_EVENT_KUNOLD_JOINED_JAVA_2020: GroupEventDto = {
	event: UserJoinedGroupEvent.name,
	timestamp: new Date(2020, 1, 3),
	userId: USER_KUNOLD.id,
	groupId: GROUP_3_JAVA2020.id
};

export function GROUP_EVENT_REJOIN_SCENARIO(): GroupEventDto[] {
	const GROUP_EVENT_STUDENT_1_JOINED_GROUP_1: GroupEventDto = {
		event: UserJoinedGroupEvent.name,
		timestamp: new Date(2020, 1, 1),
		userId: USER_STUDENT_JAVA.id,
		groupId: GROUP_1_JAVA.id,
		payload: null
	};


	const GROUP_EVENT_STUDENT_1_LEFT_GROUP_1: GroupEventDto = {
		event: UserLeftGroupEvent.name,
		timestamp: new Date(2020, 1, 2),
		userId: USER_STUDENT_JAVA.id,
		groupId: GROUP_1_JAVA.id,
		payload: null
	};
	
	const GROUP_EVENT_STUDENT_1_JOINED_GROUP_2: GroupEventDto = {
		event: UserJoinedGroupEvent.name,
		timestamp: new Date(2020, 1, 3),
		userId: USER_STUDENT_JAVA.id,
		groupId: GROUP_2_JAVA.id,
		payload: null
	};
	
	const GROUP_EVENT_STUDENT_1_LEFT_GROUP_2: GroupEventDto = {
		event: UserLeftGroupEvent.name,
		timestamp: new Date(2020, 1, 4),
		userId: USER_STUDENT_JAVA.id,
		groupId: GROUP_2_JAVA.id,
		payload: null
	};
	
	const GROUP_EVENT_STUDENT_1_REJOINED_GROUP_1: GroupEventDto = {
		event: UserJoinedGroupEvent.name,
		timestamp: new Date(2020, 1, 5),
		userId: USER_STUDENT_JAVA.id,
		groupId: GROUP_1_JAVA.id,
		payload: null
	};

	return [
		GROUP_EVENT_STUDENT_1_JOINED_GROUP_1,
		GROUP_EVENT_STUDENT_1_LEFT_GROUP_1,
		GROUP_EVENT_STUDENT_1_JOINED_GROUP_2,
		GROUP_EVENT_STUDENT_1_LEFT_GROUP_2,
		GROUP_EVENT_STUDENT_1_REJOINED_GROUP_1
	];
}

export const GROUP_EVENTS_MOCK: GroupEventDto[] = [
	...GROUP_EVENT_REJOIN_SCENARIO(),
	GROUP_EVENT_TUTOR_JOINED_GROUP,
	GROUP_EVENT_STUDENT_2_JOINED_GROUP,
	GROUP_EVENT_TUTOR_LEFT_GROUP,
	GROUP_EVENT_ELSHAR_JOINED_JAVA_2020,
	GROUP_EVENT_KUNOLD_JOINED_JAVA_2020
];

export function getGroupEventEntities(): GroupEvent[] {
	const events: GroupEvent[] = GROUP_EVENTS_MOCK.map(event => {
		const entity = new GroupEvent();
		Object.assign(entity, event);
		return entity;
	});
	return events;
}
