import { AssignmentState, AssignmentType, CollaborationType } from "../enums";

export class AssignmentDto {
	id?: string;
	courseId: string;
	name: string;
	state: AssignmentState;
	startDate?: Date;
	endDate?: Date;
	type: AssignmentType;
	collaborationType: CollaborationType;
	maxPoints: number;
	comment?: string;
	link?: string;
}