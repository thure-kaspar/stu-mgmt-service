import { UserRole } from "../../shared/enums";
import { UserId } from "../../shared/entities/user.entity";

export interface JwtPayload {
	userId: UserId;
	username: string;
	role: UserRole;
}
