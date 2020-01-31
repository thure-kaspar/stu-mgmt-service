export class AssessmentDto {
	id: string;
	achievedPoints: number;
	comment?: string;
	assignmentId: string;
	groupId?: string; // Assessment should apply to a group
	userId?: string; // Assessment should apply to a single user
}