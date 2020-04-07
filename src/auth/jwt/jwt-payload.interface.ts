import { UserRole } from "../../shared/enums";

export interface JwtPayload {
	username: string;
	role: UserRole;
}
