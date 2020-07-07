import { EventDto } from "../../../shared/dto/event.dto";
import { UserDto } from "../../../shared/dto/user.dto";

export class AssessmentEventDto extends EventDto {
	assessmentId: string;
	userId: string;
	user: UserDto;
}
