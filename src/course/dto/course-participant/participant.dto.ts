import { CourseRole } from "../../../shared/enums";
import { GroupDto } from "../group/group.dto";
import { UserId } from "../../../shared/entities/user.entity";

export class ParticipantDto {
	userId: UserId;
	username: string;
	displayName: string;
	matrNr?: number;
	email?: string;
	role: CourseRole;
	groupId?: string;
	group?: GroupDto;
}
