import { ApiPropertyOptional } from "@nestjs/swagger";
import { transformBoolean } from "../../../../test/utils/http-utils";
import { PaginationFilter } from "../../../shared/pagination.filter";

export class GroupFilter extends PaginationFilter {
	@ApiPropertyOptional({ description: "Name of the group. Compared with ILIKE %name%." })
	name?: string;
	@ApiPropertyOptional({ description: "Name of a member. Compared with ILIKE %memberName%." })
	memberName?: string;
	@ApiPropertyOptional({ description: "If true, only includes closed groups." })
	isClosed?: boolean;
	@ApiPropertyOptional({ description: "If true, excludes empty groups." })
	excludeEmpty?: boolean;

	constructor(filter?: Partial<GroupFilter>) {
		super(filter);
		this.name = filter?.name;
		this.memberName = filter?.memberName;
		this.isClosed = transformBoolean(filter?.isClosed);
		this.excludeEmpty = transformBoolean(filter?.excludeEmpty);
	}
}
