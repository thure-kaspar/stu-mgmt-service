import { ApiPropertyOptional } from "@nestjs/swagger";
import { ValidateIf, IsNotEmpty } from "class-validator";

/** Dto that can be used to create multiple groups. */
export class GroupCreateBulkDto {
	/** List of group names. */
	@ApiPropertyOptional({ description: "List of group names." })
	names?: string[];

	/** If utilized, all group names will use the nameSchema followed by the group's number. */
	@ApiPropertyOptional({
		description:
			"If utilized, all group names will use the nameSchema followed by the group's number."
	})
	@ValidateIf(o => !(o.names?.length > 0))
	@IsNotEmpty()
	nameSchema?: string;

	/** The number of groups that should be created. Should be used in conjunction with nameSchema. */
	@ApiPropertyOptional({
		description:
			"The number of groups that should be created. Should only be used in conjunction with nameSchema."
	})
	@ValidateIf(o => !(o.names?.length > 0))
	@IsNotEmpty()
	count?: number;
}
