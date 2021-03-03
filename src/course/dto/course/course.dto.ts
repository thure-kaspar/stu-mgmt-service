import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { LinkDto } from "../../../shared/dto/link.dto";

export class CourseDto {
	/** Unique identifier of this course. */
	@ApiPropertyOptional({ description: "Unique identifier of this course." })
	id?: string; // Optional: If (unused) id is supplied for creation, it will be used

	/** Shortname of this course, i.e "java". Should be reused every semester. Will be used in URLs. */
	@ApiProperty({
		description:
			'Shortname of this course, i.e "java". Should be reused every semester. Will be used in URLs.'
	})
	shortname: string;

	/** Semester that the iteration of this course belong to. */
	@ApiProperty({ description: "Semester that the iteration of this course belong to." })
	semester: string;

	/** The full title of this course, i.e Programming I: Java */
	@ApiProperty({ description: "The full title of this course, i.e Programming I: Java" })
	title: string;

	/** Determines, wether changes (i.e joining this course) can be made to this course. */
	@ApiProperty({
		description:
			"Determines, wether changes (i.e joining this course) can be made to this course."
	})
	isClosed: boolean;

	links?: LinkDto[];
}
