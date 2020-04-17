import { ApiProperty } from "@nestjs/swagger";

export class GroupSettingsDto {
	/** Determines, wether course allows group creation. */
	@ApiProperty({ description: "Determines, wether course allows group creation."})
	allowGroups: boolean;

	/** If utilized, all group names will use the nameSchema followed by the group's number. */
	@ApiProperty({ description: "If utilized, all group names will use the nameSchema followed by the group's number."})
	nameSchema: string;

	/** The required amount of members the group needs in order to submit group-assignments. */
	@ApiProperty({ description: "The required amount of members the group needs in order to submit group-assignments."})
	sizeMin: number;

	/** The maximum amount of members in a group. */
	@ApiProperty({ description: "The maximum amount of members in a group."})
	sizeMax: number;

	/** Indicates, wether the group is managed by its members. */
	@ApiProperty({ description: "Indicates, wether the group is managed by its members."})
	selfmanaged: boolean;
}
