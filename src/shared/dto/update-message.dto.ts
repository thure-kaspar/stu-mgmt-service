import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateMessage {
	/** The type of event, i.e INSERT, UPDATE or REMOVE. */
	@ApiProperty({ description: "The type of event, i.e INSERT, UPDATE or REMOVE." })
	type: "INSERT" | "UPDATE" | "REMOVE";

	/** The type of object that has been affected. */
	@ApiProperty({ description: "The type of object that has been affected." })
	affectedObject: "USER" | "GROUP" | "USER_GROUP_RELATION" | "COURSE_USER_RELATION" | "ASSIGNMENT";

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
