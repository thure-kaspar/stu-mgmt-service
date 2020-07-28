import { PaginationFilter } from "../../../shared/pagination.filter";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { transformBoolean } from "../../../../test/utils/http-utils";

export class GroupFilter extends PaginationFilter {

	@ApiPropertyOptional({ description: "Name of the group. Compared with ILIKE %name%." })
	name?: string;
	@ApiPropertyOptional({ description: "If true, only includes" })
	isClosed?: boolean;

	constructor(filter?: Partial<GroupFilter>) {
		super(filter);
		this.name = filter?.name;
		this.isClosed = transformBoolean(filter?.isClosed);
	}

}
