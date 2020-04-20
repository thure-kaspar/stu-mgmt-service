import { AssignmentState, AssignmentType, CollaborationType } from "../enums";
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";

export class AssignmentDto {
	/** Unique identifier of this assignment. */
	@ApiPropertyOptional({ description: "Unique identifier of this assignment." })
	id?: string;

	/** Identifier of the course that this assignment belongs to. */
	@ApiProperty({ description: "Identifier of the course that this assignment belongs to." })
	courseId: string;

	/** The title of this assignment. */
	@ApiProperty({ description: "The title of this assignment." })
	name: string;

	/** Determines, wether students can submit, assessments should be published, etc. */
	@ApiProperty({ description: "Determines, wether students can submit, assessments should be published, etc." })
	state: AssignmentState;

	/** Date at which this assignment should enter the IN_PROGRESS-state to allow submissions. */
	@ApiPropertyOptional({ description: "Date at which this assignment should enter the IN_PROGRESS-state to allow submissions." })
	startDate?: Date;

	/** Date at which this assignment should enter the IN_REVIEW-state to disable submissions. */
	@ApiPropertyOptional({ description: "Date at which this assignment should enter the IN_REVIEW-state to disable submissions." })
	endDate?: Date;

	/** The type of assignment, i.e homework or project. */
	@ApiProperty({ description: "The type of assignment, i.e homework or project.", example: AssignmentType.HOMEWORK })
	type: AssignmentType;

	/** Determines, wether students can submit their solutions in groups, alone or both. */
	@ApiProperty({ description: "Determines, wether students can submit their solutions in groups, alone or both." })
	collaborationType: CollaborationType;

	/** The maximum amount of points that can be reached by a participant. */
	@ApiProperty({ description: "The maximum amount of points that can be reached by a participant." })
	maxPoints: number;

	/** Additional information or description of this assignment. */
	@ApiPropertyOptional({ description: "Additional information or description of this assignment." })
	comment?: string;

	/** Additional link to a .pdf or website. */
	@ApiPropertyOptional({ description: "Additional link to a .pdf or website." })
	link?: string;
}
