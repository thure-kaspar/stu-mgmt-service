import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationFilter } from "../../../shared/pagination.filter";

export class CourseFilter extends PaginationFilter {
	@ApiPropertyOptional() // Decorator prevents "Structural error" in genered api spec
	shortname?: string;
	@ApiPropertyOptional()
	semester?: string;
	@ApiPropertyOptional()
	title?: string;
}
