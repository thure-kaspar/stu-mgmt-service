import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ValidateIf, IsNotEmpty } from "class-validator";

/**
 * Class that maps lecturers/tutors to groups and students to enable a coordinated review process.
 */
export class AssessmentAllocationDto {
	@IsNotEmpty()
	assignmentId: string;

	/** UserId of the assigned evaluator. */
	@ApiProperty({ description: "UserId of the assigned evaluator." })
	@IsNotEmpty()
	assignedEvaluatorId: string;

	/** GroupId of the group, whose solution should be evaluated by the assigned evaluator. (Either group or user must be specified.) */
	@ApiPropertyOptional({ description: "GroupId of the group, whose solution should be evaluated by the assigned evaluator." })
	@ValidateIf(o => o.userId == null || o.userId == undefined)
	@IsNotEmpty()
	groupId?: string;

	/** UserId of the user, whose solution should be evaluated by the assigned evaluator. (Either group or user must be specified.) */
	@ApiPropertyOptional({ description: "UserId of the user, whose solution should be evaluated by the assigned evaluator." })
	@ValidateIf(o => o.groupId == null || o.groupId == undefined)
	@IsNotEmpty()
	userId?: string;
}
