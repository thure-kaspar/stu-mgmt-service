import { PaginationFilter } from "../../shared/pagination.filter";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "../../shared/enums";
import { sanitizeEnum } from "../../utils/http-utils";

export class UserFilter extends PaginationFilter {
	@ApiPropertyOptional()
	username?: string;

	@ApiPropertyOptional()
	displayName?: string;

	@ApiPropertyOptional({ enum: UserRole, isArray: true })
	roles?: UserRole[];

	constructor(filter?: Partial<UserFilter>) {
		super(filter);
		this.username = filter?.username;
		this.displayName = filter?.displayName;
		this.roles = sanitizeEnum(UserRole, filter?.roles) as any;
	}
}
