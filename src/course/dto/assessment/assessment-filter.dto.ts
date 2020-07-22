import { PaginationFilter } from "../../../shared/pagination.filter";
import { transformNumber } from "../../../utils/http-utils";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AssessmentFilter extends PaginationFilter {

	@ApiPropertyOptional({ description: "Retrieves assessment of specific group." })
	groupId?: string;
	@ApiPropertyOptional({ description: "Retrieves assessment of specific user." })
	userId?: string;
	@ApiPropertyOptional({ description: "Only includes assessments with achievedPoints >= minScore, if specified." })
	minScore?: number;
	@ApiPropertyOptional({ description: "Only includes assessments created by specified user." })
	creatorId?: string;

	constructor(filter?: Partial<AssessmentFilter>) {
		super(filter);
		this.groupId = filter?.groupId;
		this.userId = filter?.userId;
		this.minScore = transformNumber(filter?.minScore);
		this.creatorId = filter?.creatorId;
	}
}
