import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AssignmentType, CollaborationType } from "../../shared/enums";

export class AssignmentTemplateDto {
	@ApiPropertyOptional({ description: "Unique identifier of this template." })
	id?: number;

	/** The name of the template. */
	@ApiProperty({ description: "The name of this template."})
	name: string;

	/** If utilized, titles will use the schema followed by the assignments's number. */
	@ApiProperty({ description: "If utilized, titles will use the schema followed by the assignments's number."})
	titleSchema: string;

	/** The preferred assignment type. */
	@ApiProperty({ description: "The preferred assignment type." })
	type: AssignmentType;

	/** The preferred collaboration type. */
	@ApiProperty({ description: "The preferred collaboration type." })
	collaboration: CollaborationType;

	/** Max. amounts of points that can be achieved in the assignments. */
	@ApiProperty({ description: "Max. amounts of points that can be achieved in the assignments." })
	points: number;
}
