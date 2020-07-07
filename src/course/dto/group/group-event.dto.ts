import { UserDto } from "../../../shared/dto/user.dto";
import { EventDto } from "../../../shared/dto/event.dto";

export class GroupEventDto extends EventDto {
	user?: UserDto;
	userId: string;
	groupId: string;
}
