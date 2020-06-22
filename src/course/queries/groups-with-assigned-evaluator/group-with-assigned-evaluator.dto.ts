import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationFilter } from "../../../shared/pagination.filter";
import { GroupDto } from "../../dto/group/group.dto";

export class GroupWithAssignedEvaluatorDto {
	group: GroupDto;

	@ApiPropertyOptional({ description: "UserId of the assigned evaluator (for assignment)." })
	assignedEvaluatorId?: string;
}

export class AssignedEvaluatorFilter extends PaginationFilter {
	@ApiPropertyOptional({ description: "Filter by assigned evaluator." })
	assignedEvaluatorId?: string;
	@ApiPropertyOptional({ description: "Excludes groups/users that have already been reviewed." })
	excludeAlreadyReviewed?: boolean;
}
