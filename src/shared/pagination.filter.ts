import { ApiPropertyOptional } from "@nestjs/swagger";
import { transformNumber } from "../../test/utils/http-utils";

export class PaginationFilter {
	@ApiPropertyOptional({ description: "[Pagination] The amount of elements that should be skipped." })
	skip?: number;
	@ApiPropertyOptional({ description: "[Pagination] The amount of elements that should be included in the response." })
	take?: number;
	
	constructor(filter: Partial<PaginationFilter>) {
		this.skip = transformNumber(filter?.skip);
		this.take = transformNumber(filter?.take);
	}
}
