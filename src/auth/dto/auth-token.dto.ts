import { UserRole } from "../../shared/enums";
import { UserId } from "../../shared/entities/user.entity";

export class AuthTokenDto {
	accessToken: string;
	userId: UserId;
	username: string;
	email: string;
	role: UserRole;
}
