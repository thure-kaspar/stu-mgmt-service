import { GroupDto } from "./group.dto";

export class AssessmentDto {
	id?: string;
	assignmentId: string;
	achievedPoints: number;
	comment?: string;
	groupId?: string; // Assessment should apply to a group
	group?: GroupDto;
	userId?: string; // Assessment should apply to a single user
}