import { PaginationFilter } from "../../../shared/pagination.filter";
import { CourseRole } from "../../../shared/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { sanitizeEnum } from "../../../utils/http-utils";

export class CourseParticipantsFilter extends PaginationFilter {
	@ApiPropertyOptional({ enum: CourseRole, type: CourseRole, isArray: true })
	courseRole?: CourseRole[];
	@ApiPropertyOptional({ description: "Compared to the participant's username and displayName with ILIKE %name%." })
	name?: string;

	constructor(filter?: Partial<CourseParticipantsFilter>) {
		super(filter);
		this.name = filter?.name;
		this.courseRole = sanitizeEnum(CourseRole, filter?.courseRole) as any;
	}

}
