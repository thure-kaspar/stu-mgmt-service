import { UserDto } from "../../../shared/dto/user.dto";
import { EventDto } from "../../../shared/dto/event.dto";
import { GroupId } from "../../entities/group.entity";
import { UserId } from "../../../shared/entities/user.entity";

export class GroupEventDto extends EventDto {
	user?: UserDto;
	userId: UserId;
	groupId: GroupId;
}
