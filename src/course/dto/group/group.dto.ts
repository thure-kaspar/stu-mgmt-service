import { ApiProperty, ApiPropertyOptional, PickType } from "@nestjs/swagger";
import { IsNotEmpty, ValidateIf, MinLength } from "class-validator";
import { CourseId } from "../../entities/course.entity";
import { AssessmentDto } from "../assessment/assessment.dto";
import { ParticipantDto } from "../course-participant/participant.dto";
import { CourseDto } from "../course/course.dto";
import { GroupEventDto } from "./group-event.dto";

export class GroupDto {
	/** Unique identifier of this group. */
	@ApiPropertyOptional({ description: "Unique identifier of this group."})
	id?: string;
	
	/** Identifier of the course that this group belongs to. */
	@ApiProperty({ description: "Identifier of the course that this group belongs to." })
	courseId: CourseId;
	
	/** The course that this group belongs to. */
	//@ApiPropertyOptional({ description: "The course that this group belongs to.", type: () => CourseDto })
	course?: CourseDto;

	/** Name of the group. */
	@ApiProperty({ description: "Name of the group." })
	@IsNotEmpty()
	name: string;
	
	/** Password required to enter the group. */
	@ApiPropertyOptional({ description: "Password required to enter the group." })
	password?: string;
	
	/** Determines, wether course participant are able to join this group. */
	@ApiPropertyOptional({ description: "Determines, wether course participant are able to join this group." })
	isClosed?: boolean;
	
	/** The members of this group. */
    users?: ParticipantDto[];
	history?: GroupEventDto[];
	assessments?: AssessmentDto[];
}

export class GroupUpdateDto {
	@ValidateIf(o => o.name)
	@MinLength(1)
	name?: string;

	@ValidateIf(o => o.password)
	@MinLength(1)
	password?: string;
	
	isClosed?: boolean; 
}
