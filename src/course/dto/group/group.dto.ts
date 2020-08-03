import { CourseDto } from "../course/course.dto";
import { UserDto } from "../../../shared/dto/user.dto";
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { GroupEventDto } from "./group-event.dto";
import { AssessmentDto } from "../assessment/assessment.dto";
import { CourseId } from "../../entities/course.entity";
import { IsNotEmpty } from "class-validator";

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
	//@ApiPropertyOptional({ description: "The members of this group.", type: UserDto, isArray: true })
    users?: UserDto[];
	history?: GroupEventDto[];
	assessments?: AssessmentDto[];
}
