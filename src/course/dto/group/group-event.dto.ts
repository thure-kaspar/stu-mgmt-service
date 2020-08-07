import { UserDto } from "../../../shared/dto/user.dto";
import { EventDto } from "../../../shared/dto/event.dto";
import { GroupId } from "../../entities/group.entity";

export class GroupEventDto extends EventDto {
	user?: UserDto;
	userId: string;
	groupId: GroupId;
}
