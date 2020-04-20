import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum EventType {
	INSERT = "INSERT",
	UPDATE = "UPDATE",
	REMOVE = "REMOVE"
}

export enum AffectedObject {
	USER = "USER",
	GROUP = "GROUP",
	USER_GROUP_RELATION = "USER_GROUP_RELATION",
	COURSE_USER_RELATION = "COURSE_USER_RELATION",
	ASSIGNMENT = "ASSIGNMENT"
}

export class UpdateMessage {
	/** The type of event, i.e INSERT, UPDATE or REMOVE. */
	@ApiProperty({ description: "The type of event, i.e INSERT, UPDATE or REMOVE." })
	type: EventType;

	/** The type of object that has been affected. */
	@ApiProperty({ description: "The type of object that has been affected." })
	affectedObject: AffectedObject;

	/** Identifier of the course, in which the event happened. */
	@ApiProperty({ description: "Identifier of the course, in which the event happened." })
	courseId: string;

	/** Identifier of the entity that has changed. Type is always indicated by the first noun of affectedObject. */
	@ApiProperty({ description: "Identifier of the entity that has changed. Type is always indicated by the first noun of affectedObject." })
	entityId: string;

	/** Identifier of the related entity that has changed. Type is always the second noun of affectedObject. */
	@ApiPropertyOptional({ description: "Identifier of the related entity that has changed. Type is always the second noun of affectedObject." })
	entityId_relation?: string;

	/** Timestamp of the event. */
	@ApiPropertyOptional({ description: "Timestamp of the event."})
	date?: Date; 
}
