import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Min } from "class-validator";

export class GroupSettingsDto {
	/** Determines, wether course allows group creation. */
	@ApiProperty({ description: "Determines, wether course allows group creation."})
	allowGroups: boolean;

	/** If utilized, all group names will use the nameSchema followed by the group's number. */
	@ApiPropertyOptional({ description: "If utilized, all group names will use the nameSchema followed by the group's number."})
	nameSchema?: string;

	/** The required amount of members the group needs in order to submit group-assignments. */
	@ApiProperty({ description: "The required amount of members the group needs in order to submit group-assignments."})
	@Min(0)
	sizeMin: number;

	/** The maximum amount of members in a group. */
	@ApiProperty({ description: "The maximum amount of members in a group."})
	@Min(0)
	sizeMax: number;

	/** Indicates, wether the group is managed by its members. */
	@ApiProperty({ description: "Indicates, wether the group is managed by its members."})
	selfmanaged: boolean;
}

/** Version of GroupSettingsDto that only contains editable properties. */
export class GroupSettingsUpdateDto extends PartialType(GroupSettingsDto) { }
