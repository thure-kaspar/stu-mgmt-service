import { PartialType, OmitType } from "@nestjs/swagger";
import { CourseConfigDto } from "./course-config.dto";

/** Version of CourseConfigDto that only contains editable properties. */
export class CourseConfigUpdateDto extends PartialType(
	OmitType(CourseConfigDto, [
		"id",
		"groupSettings", 
		"admissionCriteria", 
		"assignmentTemplates"
	])) { }
