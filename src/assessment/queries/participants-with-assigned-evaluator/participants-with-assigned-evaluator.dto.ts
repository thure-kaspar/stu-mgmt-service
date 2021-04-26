import { ApiPropertyOptional } from "@nestjs/swagger";
import { ParticipantDto } from "../../../course/dto/course-participant/participant.dto";

export class ParticipantsWithAssignedEvaluatorDto {
	participant: ParticipantDto;

	@ApiPropertyOptional({ description: "UserId of the assigned evaluator (for assignment)." })
	assignedEvaluatorId?: string;

	@ApiPropertyOptional({ description: "Id of the assessment for this user, if it exists." })
	assessmentId?: string;
}
