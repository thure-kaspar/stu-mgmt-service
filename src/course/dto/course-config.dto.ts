import { GroupSettingsDto } from "./group-settings.dto";
import { AssignmentTemplateDto } from "./assignment-template.dto";
import { AdmissionCriteriaDto } from "./admission-criteria.dto";
import { PartialType, OmitType } from "@nestjs/swagger";

/**
 * A dto that contains the configuration of a course.
 */
export class CourseConfigDto {
	id?: number; 
	
	groupSettings?: GroupSettingsDto;
	admissionCriteria?: AdmissionCriteriaDto;
	assignmentTemplates?: AssignmentTemplateDto[];

	password?: string;
	subscriptionUrl?: string;
}

/** Version of CourseConfigDto that only contains editable properties. */
export class CourseConfigUpdateDto extends PartialType(
	OmitType(CourseConfigDto, [
		"id",
		"groupSettings", 
		"admissionCriteria", 
		"assignmentTemplates"
	])) { }

