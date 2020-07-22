import { UserDto } from "../../../shared/dto/user.dto";
import { ApiProperty } from "@nestjs/swagger";

export class ParticipantsComparisonDto {
	inComparedCourses: UserDto[];
	notInComparedCourses: UserDto[];
}
