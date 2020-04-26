import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger";
import { AssignmentDto } from "../../shared/dto/assignment.dto";

export class AssignmentTemplateDto extends PartialType(OmitType(AssignmentDto, ["id", "courseId"])) {
	@ApiPropertyOptional({ description: "Unique identifier of this template." })
	id?: number;

	/** The name of the template. */
	@ApiProperty({ description: "The name of this template."})
	templateName: string;
}
