import { CourseRole } from "../../../shared/enums";
import { Assessment } from "../../entities/assessment.entity";
import { GroupDto } from "../group/group.dto";

export class ParticipantDto {
	userId: string;
	username: string;
	rzName: string;
	role: CourseRole;
	groupId?: string;
	group?: GroupDto;
	assessments?: Assessment[];
}
