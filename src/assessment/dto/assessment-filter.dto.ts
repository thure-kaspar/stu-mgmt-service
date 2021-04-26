import { ApiPropertyOptional } from "@nestjs/swagger";
import { transformNumber } from "../../../test/utils/http-utils";
import { PaginationFilter } from "../../shared/pagination.filter";

export class AssessmentFilter extends PaginationFilter {
	@ApiPropertyOptional({ description: "Name of group or user. Matched with ILIKE %name%." })
	name?: string;
	@ApiPropertyOptional({ description: "Retrieves assessment of specific group." })
	groupId?: string;
	@ApiPropertyOptional({ description: "Retrieves assessment of specific user." })
	userId?: string;
	@ApiPropertyOptional({
		description: "Only includes assessments with achievedPoints >= minScore, if specified."
	})
	minScore?: number;
	@ApiPropertyOptional({ description: "Only includes assessments created by specified user." })
	creatorId?: string;

	constructor(filter?: Partial<AssessmentFilter>) {
		super(filter);
		this.name = filter?.name;
		this.groupId = filter?.groupId;
		this.userId = filter?.userId;
		this.minScore = transformNumber(filter?.minScore);
		this.creatorId = filter?.creatorId;
	}
}
