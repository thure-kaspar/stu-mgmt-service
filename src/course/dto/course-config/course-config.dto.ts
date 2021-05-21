import { ApiPropertyOptional, PartialType, PickType } from "@nestjs/swagger";
import { AdmissionCriteriaDto } from "./admission-criteria.dto";
import { AssignmentTemplateDto } from "./assignment-template.dto";
import { GroupSettingsDto } from "./group-settings.dto";

/**
 * A dto that contains the configuration of a course.
 */
export class CourseConfigDto {
	@ApiPropertyOptional({ description: "Unique identifier of the configuration." })
	id?: number;
	groupSettings?: GroupSettingsDto;
	admissionCriteria?: AdmissionCriteriaDto;
	assignmentTemplates?: AssignmentTemplateDto[];

	/** Password required to sign up for the course. */
	@ApiPropertyOptional({ description: "Password required to sign up for the course." })
	password?: string;
}

/** Version of CourseConfigDto that only contains editable properties. */
export class CourseConfigUpdateDto extends PartialType(PickType(CourseConfigDto, ["password"])) {}
