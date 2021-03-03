import { GroupSettingsDto } from "./group-settings.dto";
import { AssignmentTemplateDto } from "./assignment-template.dto";
import { AdmissionCriteriaDto } from "./admission-criteria.dto";
import { PartialType, OmitType, ApiPropertyOptional } from "@nestjs/swagger";

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

	/** The route that update messages (i.e user left group or assignment submission closed) should be send to. Messages be send via HTTP-POST. */
	@ApiPropertyOptional({
		description:
			"The route that update messages (i.e user left group or assignment submission closed) should be send to. Will be send via HTTP-POST.",
		example: "http://update.me/api"
	})
	subscriptionUrl?: string;
}

/** Version of CourseConfigDto that only contains editable properties. */
export class CourseConfigUpdateDto extends PartialType(
	OmitType(CourseConfigDto, ["id", "groupSettings", "admissionCriteria", "assignmentTemplates"])
) {}
