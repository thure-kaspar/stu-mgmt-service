import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationFilter } from "../shared/pagination.filter";

export class SubmissionFilter extends PaginationFilter {
	@ApiPropertyOptional({ description: "Filters by userId." })
	userId?: string;
	@ApiPropertyOptional({ description: "Filters by assignmentId." })
	assignmentId?: string;
	@ApiPropertyOptional({ description: "Filters by groupId." })
	groupId?: string;
	@ApiPropertyOptional({
		description: "Filters by user's displayName. Matched with ILIKE %displayName%."
	})
	displayName?: string;
	@ApiPropertyOptional({ description: "Filters by group name. Matched with ILIKE %groupName%." })
	groupName?: string;

	constructor(filter: Partial<SubmissionFilter>) {
		super(filter);

		if (filter) {
			this.userId = filter.userId;
			this.assignmentId = filter.assignmentId;
			this.groupId = filter.groupId;
			this.displayName = filter.displayName;
			this.groupName = filter.groupName;
		}
	}
}
