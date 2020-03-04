import { ApiPropertyOptional } from "@nestjs/swagger";

export class CourseFilterDto {
	@ApiPropertyOptional() // Decorator prevents "Structural error" in genered api spec
	shortname?: string;
	@ApiPropertyOptional()
	semester?: string;
	@ApiPropertyOptional()
	title?: string;
}
