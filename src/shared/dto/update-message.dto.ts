import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CourseId } from "../../course/entities/course.entity";
import { Event } from "../../course/events";
import { AssignmentId } from "../../course/entities/assignment.entity";
import { GroupId } from "../../course/entities/group.entity";
import { UserId } from "../entities/user.entity";

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

export class Notification {
	event: Event;
	courseId: CourseId;
	assignmentId?: AssignmentId;
	groupId?: GroupId;
	userId?: UserId;
	payload?: object;
	date? = new Date();
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
	courseId: CourseId;

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
