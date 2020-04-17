import { UserDto } from "../../shared/dto/user.dto";
import { GroupSettingsDto } from "./group-settings.dto";
import { AssignmentTemplateDto } from "./assignment-template.dto";
import { AdmissionCriteriaDto } from "./admission-criteria";

/**
 * A dto that contains the configuration of a course.
 */
export class CourseConfigDto {
	groupSettings: GroupSettingsDto;
	admissionCriteria: AdmissionCriteriaDto;
	assignmentTemplates: AssignmentTemplateDto[];
	lecturers: UserDto[];
}


