import { OmitType } from "@nestjs/swagger";
import { CourseDto } from "./course.dto";

export class CourseCreateDto extends OmitType(CourseDto, ["groups", "assignments", "users"]) {
	
	/** Usernames of the lecturers. */
	lecturers?: string[];
}
