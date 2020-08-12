import { PaginationFilter } from "../../../shared/pagination.filter";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { transformBoolean, transformNumber } from "../../../../test/utils/http-utils";

export class GroupFilter extends PaginationFilter {

	@ApiPropertyOptional({ description: "Name of the group. Compared with ILIKE %name%." })
	name?: string;
	@ApiPropertyOptional({ description: "If true, only includes" })
	isClosed?: boolean;
	@ApiPropertyOptional({ description: "Only include groups with at least minSize members." })
	minSize?: number;
	@ApiPropertyOptional({ description: "Only include groups with at most maxSize members." })
	maxSize?: number;

	constructor(filter?: Partial<GroupFilter>) {
		super(filter);
		this.name = filter?.name;
		this.isClosed = transformBoolean(filter?.isClosed);
		this.minSize = transformNumber(filter?.minSize);
		this.maxSize = transformNumber(filter?.maxSize);
	}

}
