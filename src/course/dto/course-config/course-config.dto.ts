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

	/** Settings that determine wether groups are allowed, allowed group sizes, etc. */
	//@ApiPropertyOptional({ description: "Settings that determine wether groups are allowed, allowed group sizes, etc.", type: GroupSettingsDto })
	groupSettings?: GroupSettingsDto;

	/** A rule-based description of the necessary requirements to receive admission to the exam or passing a course. */
	//@ApiPropertyOptional({ description: "A rule-based description of the necessary requirements to receive admission to the exam or passing a course.", type: AdmissionCriteriaDto })
	admissionCriteria?: AdmissionCriteriaDto;

	/** Templates that can be used in the client to create new assignments. */
	//@ApiPropertyOptional({ description: "Templates that can be used in the client to create new assignments.", type: AssignmentTemplateDto })
	assignmentTemplates?: AssignmentTemplateDto[];

	/** Password required to sign up for the course. */
	@ApiPropertyOptional({ description: "Password required to sign up for the course." })
	password?: string;
}

/** Version of CourseConfigDto that only contains editable properties. */
export class CourseConfigUpdateDto extends PartialType(PickType(CourseConfigDto, ["password"])) {}
