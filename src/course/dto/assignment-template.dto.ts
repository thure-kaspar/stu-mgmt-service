import { ApiProperty } from "@nestjs/swagger";
import { AssignmentType, CollaborationType } from "../../shared/enums";

export class AssignmentTemplateDto {
	/** If utilized, titles will use the schema followed by the assignments's number. */
	@ApiProperty({ description: "If utilized, titles will use the schema followed by the assignments's number."})
	titleSchema: string;

	/** The prefered assignment type. */
	@ApiProperty({ description: "The prefered assignment type." })
	type: AssignmentType;

	/** The prefered collaboration type. */
	@ApiProperty({ description: "The prefered collaboration type." })
	collaboration: CollaborationType;

	/** Max. amounts of points that can be achieved in the assignments. */
	@ApiProperty({ description: "Max. amounts of points that can be achieved in the assignments." })
	points: number;
}
