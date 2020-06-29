import { ApiPropertyOptional } from "@nestjs/swagger";
import { UserDto } from "../../../shared/dto/user.dto";

export class UserWithAssignedEvaluatorDto {
	user: UserDto;

	@ApiPropertyOptional({ description: "UserId of the assigned evaluator (for assignment)." })
	assignedEvaluatorId?: string;

	@ApiPropertyOptional({ description: "Id of the assessment for this user, if it exists." })
	assessmentId?: string;
}
