import { UserDto } from "../../shared/dto/user.dto";
import { GroupSettingsDto } from "./group-settings.dto";
import { AssignmentTemplateDto } from "./assignment-template.dto";
import { AdmissionCriteriaDto } from "./admission-criteria.dto";

/**
 * A dto that contains the configuration of a course.
 */
export class CourseConfigDto {
	id?: number; 
	
	groupSettings?: GroupSettingsDto;
	admissionCriteria?: AdmissionCriteriaDto;
	assignmentTemplates?: AssignmentTemplateDto[];
	lecturers?: UserDto[];

	password?: string;
	subscriptionUrl?: string;
}


