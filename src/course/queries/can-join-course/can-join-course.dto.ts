import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CanJoinCourseDto {
	@ApiProperty({ description: "Indicates, wether the joining the course is possible." })
	canJoin: boolean;
	@ApiPropertyOptional({ description: "Indicates, wether the joining the course requires a password." })
	requiresPassword?: boolean;
	@ApiPropertyOptional({ enum: ["CLOSED", "IS_MEMBER"], description: "The reason why joining the course is not possible." })
	reason?: "CLOSED" | "IS_MEMBER";
}
