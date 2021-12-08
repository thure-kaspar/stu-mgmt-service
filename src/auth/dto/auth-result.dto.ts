import { UserDto } from "../../shared/dto/user.dto";

export class AuthResultDto {
	user: UserDto;
	accessToken: string;
	expiration?: Date;
}
