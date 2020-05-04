import { UserDto } from "../../../shared/dto/user.dto";

export class GroupEventDto {
	user: UserDto;
	event: string;
	payload?: object;
	timestamp: Date;
}
