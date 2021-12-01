import { ApiProperty } from "@nestjs/swagger";
import { Event } from "../../course/events/events";

export type SubscribedEvents = { [key in Event]?: boolean } & { ALL?: boolean };

export class SubscriberDto {
	@ApiProperty({ description: "Name of your application." })
	name: string;

	@ApiProperty({
		description:
			"Complete URL to an endpoint in your application that receives HTTP-POST messages."
	})
	url: string;

	@ApiProperty({
		type: Object,
		description:
			"Map of events that you want to be notified about. Refer to the Event-Enum for event names. You can use 'ALL' to subscribe to all events.",
		example: `{"${Event.USER_JOINED_GROUP}": true,
		"${Event.ASSIGNMENT_STATE_CHANGED}": true
		}`
	})
	events: SubscribedEvents;

	@ApiProperty({ description: "Date of the creation or latest update to the subscription." })
	updateDate?: Date;
}
