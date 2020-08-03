import { CourseRole } from "../../../shared/enums";
import { AssessmentDto } from "../assessment/assessment.dto";
import { GroupDto } from "../group/group.dto";

export class ParticipantDto {
	userId: string;
	username: string;
	rzName: string;
	role: CourseRole;
	groupId?: string;
	group?: GroupDto;
	assessments?: AssessmentDto[];
}
