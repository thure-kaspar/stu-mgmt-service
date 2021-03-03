import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator";
import { ParticipantDto } from "../course-participant/participant.dto";
import { GroupEventDto } from "./group-event.dto";

export class GroupDto {
	/** Unique identifier of this group. */
	@ApiPropertyOptional({ description: "Unique identifier of this group." })
	id?: string;

	/** Name of the group. */
	@ApiProperty({ description: "Name of the group." })
	@IsNotEmpty()
	name: string;

	/** Password required to enter the group. */
	@ApiPropertyOptional({ description: "Password required to enter the group." })
	password?: string;

	/** Indicates, wether group has a password. Set by the server. */
	@ApiPropertyOptional({
		description: "Indicates, wether group has a password. Set by the server."
	})
	hasPassword?: boolean;

	/** Count of group members. Set by the server. */
	@ApiPropertyOptional({ description: "Count of group members. Set by the server." })
	size?: number;

	/** Determines, wether course participant are able to join this group. */
	@ApiPropertyOptional({
		description: "Determines, wether course participant are able to join this group."
	})
	isClosed?: boolean;

	/** The members of this group. */
	members?: ParticipantDto[];
	history?: GroupEventDto[];
}

/**
 * Sets the given participants as `group.members` and updates the `group._size`.
 */
export function setMembers(group: GroupDto, members: ParticipantDto[]): void {
	group.members = members;
	group.size = members.length;
}

export class GroupUpdateDto {
	@IsOptional()
	@IsNotEmpty()
	name?: string;

	@IsOptional()
	password?: string;

	@IsOptional()
	@IsBoolean()
	isClosed?: boolean;
}
