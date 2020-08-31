import { UserDto } from "../../shared/dto/user.dto";

export class AuthTokenDto {
	accessToken: string;
	user: UserDto;
	expiration?: Date;
	_expirationInLocale: string;
}
