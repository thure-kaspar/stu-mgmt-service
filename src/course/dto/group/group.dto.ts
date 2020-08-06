import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator";
import { AssessmentDto } from "../assessment/assessment.dto";
import { ParticipantDto } from "../course-participant/participant.dto";
import { GroupEventDto } from "./group-event.dto";

export class GroupDto {
	/** Unique identifier of this group. */
	@ApiPropertyOptional({ description: "Unique identifier of this group."})
	id?: string;

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
	@IsOptional()
	@IsNotEmpty()
	name?: string;

	@IsOptional()
	password?: string;
	
	@IsOptional()
	@IsBoolean()
	isClosed?: boolean; 
}
