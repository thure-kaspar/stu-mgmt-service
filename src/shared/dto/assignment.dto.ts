import { AssignmentStates, AssignmentTypes } from "../enums";

export class AssignmentDto {
	id?: string;
	courseId: string;
	name: string;
	state: AssignmentStates;
	startDate?: Date;
	endDate?: Date;
	type: AssignmentTypes;
	maxPoints: number;
	comment?: string;
	link?: string;
}