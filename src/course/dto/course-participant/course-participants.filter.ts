import { PaginationFilter } from "../../../shared/pagination.filter";
import { CourseRole } from "../../../shared/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class CourseParticipantsFilter extends PaginationFilter {
	@ApiPropertyOptional({ enum: CourseRole, type: CourseRole, isArray: true })
	courseRole?: CourseRole[];
	@ApiPropertyOptional({ description: "Compared to the participant's username and displayName with ILIKE %name%." })
	name?: string;
}
