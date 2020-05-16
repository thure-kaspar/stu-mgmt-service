import { UserDto } from "../../../shared/dto/user.dto";

export class GroupEventDto {
	event: string;
	user?: UserDto;
	userId: string;
	groupId: string;
	payload?: object;
	timestamp: Date;
}
