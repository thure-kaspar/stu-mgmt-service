import { UserDto } from "./user.dto";
import { GroupDto } from "./group.dto";
import { AssignmentDto } from "./assignment.dto";
import { CourseConfigDto } from "../../course/dto/course-config.dto";
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";

export class CourseDto {
	/** Unique identifier of this course. */
	@ApiPropertyOptional({ description: "Unique identifier of this course." })
	id?: string; // Optional: If (unused) id is supplied for creation, it will be used
	
	/** Shortname of this course, i.e "java". Should be reused every semester. Will be used in URLs. */
	@ApiProperty({ description: "Shortname of this course, i.e \"java\". Should be reused every semester. Will be used in URLs." })
	shortname: string;
	
	/** Semester that the iteration of this course belong to. */
	@ApiProperty({ description: "Semester that the iteration of this course belong to." })
	semester: string;
	
	/** The full title of this course, i.e Programming I: Java */
	@ApiProperty({ description: "The full title of this course, i.e Programming I: Java" })
	title: string;
	
	/** Determines, wether changes (i.e joining this course) can be made to this course. */
	@ApiProperty({ description: "Determines, wether changes (i.e joining this course) can be made to this course." })
	isClosed: boolean;
	
	/** Additional link to another website. */
	@ApiPropertyOptional({ description: "Additional link to another website." })
	link?: string;

	/** The participants of this course. Includes students, tutors and lecturers. */
	//@ApiPropertyOptional({ description: "The participants of this course. Includes students, tutors and lecturers.", type: () => UserDto, isArray: true })
	users?: UserDto[];

	/** The groups of this course. */
	//@ApiPropertyOptional({ description: "The groups of this course.", type: () => GroupDto, isArray: true })
	groups?: GroupDto[];

	/** The assignments of this course. */
	//@ApiPropertyOptional({ description: "The assignments of this course.", type: AssignmentDto, isArray: true })
	assignments?: AssignmentDto[];

	/** The configuration of this course. */
	//@ApiPropertyOptional({ description: "The configuration of this course.", type: CourseConfigDto })
	config?: CourseConfigDto;
}
