import { OmitType } from "@nestjs/swagger";
import { CourseConfigDto } from "../course-config/course-config.dto";
import { CourseDto } from "./course.dto";

export class CourseCreateDto extends OmitType(CourseDto, ["groupSettings", "admissionCriteria"]) {
	config: CourseConfigDto;
	/** Usernames of the lecturers. */
	lecturers?: string[];
}
