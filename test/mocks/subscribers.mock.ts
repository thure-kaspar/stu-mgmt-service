import { SubscriberDto } from "../../src/notification/subscriber/subscriber.dto";
import { COURSE_INFO_2_2020 } from "./courses.mock";

export const SUBSCRIBER_1_INFO_SOSE2020: SubscriberDto = {
	name: "subscriber_1",
	url: "http://example-one.url",
	events: {
		ALL: true
	},
	updateDate: new Date(2021, 4, 4, 4, 4)
};

export const SUBSCRIBER_2_INFO_SOSE2020: SubscriberDto = {
	name: "subscriber_2",
	url: "http://example-two.url",
	events: {
		USER_JOINED_GROUP: true,
		USER_LEFT_GROUP: true,
		GROUP_REGISTERED: true,
		GROUP_UNREGISTERED: true
	},
	updateDate: new Date(2021, 4, 4, 4, 4)
};

export const SUBSCRIBER_MOCK: { courseId: string; dto: SubscriberDto }[] = [
	{ courseId: COURSE_INFO_2_2020.id, dto: SUBSCRIBER_1_INFO_SOSE2020 },
	{ courseId: COURSE_INFO_2_2020.id, dto: SUBSCRIBER_2_INFO_SOSE2020 }
];
