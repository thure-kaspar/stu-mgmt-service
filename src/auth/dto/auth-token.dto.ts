import { UserRole } from "../../shared/enums";

export class AuthTokenDto {
	accessToken: string;
	userId: string;
	email: string;
	role: UserRole;
}
