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

	/** The amount of points that can be reached by a participant (exluding bonus points). */
	@ApiProperty({ description: "The amount of points that can be reached by a participant (exluding bonus points)." })
	points: number;

	/** The amount of additional bonus points, which should be exluded from the admission criteria. */
	@ApiPropertyOptional({ description: "The amount of additional bonus points, which should be exluded from the admission criteria." })
	bonusPoints?: number;
}
