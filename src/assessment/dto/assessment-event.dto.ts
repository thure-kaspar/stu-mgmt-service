import { EventDto } from "../../shared/dto/event.dto";
import { UserDto } from "../../shared/dto/user.dto";
import { UserId } from "../../shared/entities/user.entity";

export class AssessmentEventDto extends EventDto {
	assessmentId: string;
	userId: UserId;
	user: UserDto;
}
