import { ApiPropertyOptional } from "@nestjs/swagger";

export class PaginationFilter {
	@ApiPropertyOptional({ description: "[Pagination] The amount of elements that should be skipped." })
	skip?: number;
	@ApiPropertyOptional({ description: "[Pagination] The amount of elements that should be included in the response." })
	take?: number;
}
