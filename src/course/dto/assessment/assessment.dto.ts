import { ApiProperty, ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { UserDto } from "../../../shared/dto/user.dto";
import { GroupDto } from "../group/group.dto";
import { PartialAssessmentDto } from "./partial-assessment.dto";

export class AssessmentDto {
	/** Unique identifier of this assessment. */
	@ApiPropertyOptional({ description: "Unique identifier of this assessment."})
	id?: string;

	/** Identifier of the assignment that is being evaluated by this assessment. */
	@ApiProperty({ description: "Identifier of the assignment that is being evaluated by this assessment."})
	assignmentId: string;

	/** The amount of points that the student or group achieved with their submission. */
	@ApiProperty({ description: "The amount of points that the student or group achieved with their submission."})
	achievedPoints: number;

	/** A comment providing additional feedback. */
	@ApiPropertyOptional({ description: "A comment providing additional feedback."})
	comment?: string;

	/** If a group submission is being evaluated, contains the identifier of the group. */
	@ApiPropertyOptional({ description: "If a group submission is being evaluated, contains the identifier of the group."})
	groupId?: string;

	/** The group, whose submission was evaluated by this assessment. */
	//@ApiPropertyOptional({ description: "The group, whose submission was evaluated by this assessment.", type: () => GroupDto })
	group?: GroupDto;

	/** If a single user is being evaluated, contains the identifier of the user. */
	@ApiPropertyOptional({ description: "If a single user is being evaluated, contains the identifier of the user."})
	userId?: string;

	/** If assessment targets a single user, contains the user. */
	//@ApiPropertyOptional({ description: "If assessment targets a single user, contains the user.", type: () => UserDto })
	user?: UserDto;

	/** Identifier of the creator of this assessment. */
	@ApiPropertyOptional({ description: "Identifier of the creator of this assessment."})
	creatorId: string;

	/** The creator of this assessment. */
	//@ApiPropertyOptional({ description: "The creator of this assessment.", type: () => UserDto })
	creator?: UserDto;
	partialAssessments?: PartialAssessmentDto[];
}

/** Version of AssessmentDto containing only properties that can used for creation. */
export class AssessmentCreateDto extends OmitType(AssessmentDto, ["group", "user", "creator", "id"]) { }
/** Version of AssessmentDto containing only properties that can be updated. */
export class AssessmentUpdateDto {
	
	achievedPoints?: number;
	comment?: string;
	addPartialAssessments?: PartialAssessmentDto[];
	updatePartialAssignments?: PartialAssessmentDto[];
	removePartialAssignments?: PartialAssessmentDto[];
}
