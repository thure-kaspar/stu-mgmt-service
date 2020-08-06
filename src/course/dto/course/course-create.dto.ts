import { CourseConfigDto } from "../course-config/course-config.dto";
import { CourseDto } from "./course.dto";

export class CourseCreateDto extends CourseDto {
	config: CourseConfigDto;
	/** Usernames of the lecturers. */
	lecturers?: string[];
}
