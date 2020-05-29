import { UserRole } from "../../shared/enums";

export interface JwtPayload {
	userId: string;
	username: string;
	role: UserRole;
}
