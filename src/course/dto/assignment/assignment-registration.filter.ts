import { PaginationFilter } from "../../../shared/pagination.filter";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AssignmentRegistrationFilter extends PaginationFilter {
	@ApiPropertyOptional()
	groupname?: string;

	constructor(filter?: Partial<AssignmentRegistrationFilter>) {
		super(filter);
		this.groupname = filter?.groupname;
	}
}
