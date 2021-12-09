import { UserDto } from "../../../shared/dto/user.dto";

export class ParticipantsComparisonDto {
	inComparedCourses: UserDto[];
	notInComparedCourses: UserDto[];
}
