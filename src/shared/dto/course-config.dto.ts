import { CourseDto } from "./course.dto";
import { UserDto } from "./user.dto";
import { ArrayMinSize, ValidateNested } from "class-validator";

/**
 * A dto that contains the course itself (without relations) and additonal properties
 * that make up the course's configuration (i.e Lecturer of the course).
 */
export class CourseConfigDto {
	@ValidateNested()
	course: CourseDto;

	/**
	 * The lecturers of the course.
	 */
	@ArrayMinSize(1)
	lecturers: UserDto[];
}
