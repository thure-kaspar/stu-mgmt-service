import { AssignmentTemplateDto } from "../../../src/course/dto/assignment-template.dto";
import { CollaborationType, AssignmentType, AssignmentState } from "../../../src/shared/enums";

export const ASSIGNMENT_TEMPLATE_GROUP_HW: AssignmentTemplateDto = {
	id: 1,
	templateName: "Hausaufgabe-Template",
	name: "Hausaufgabe",
	state: AssignmentState.IN_PROGRESS,
	type: AssignmentType.HOMEWORK,
	collaboration: CollaborationType.GROUP,
	points: 100,
	bonusPoints: 10,
	timespanDays: 7
};

export const ASSIGNMENT_TEMPLATE_TESTAT: AssignmentTemplateDto = {
	id: 2,
	templateName: "Testat-Template",
	name: "Testat",
	state: AssignmentState.INVISIBLE,
	type: AssignmentType.TESTAT,
	collaboration: CollaborationType.SINGLE,
	points: 100,
	bonusPoints: null
};

export const ASSIGNMENT_TEMPLATE_PROJECT: AssignmentTemplateDto = {
	id: 3,
	templateName: "Projekt-Template",
	name: "Projekt",
	state: AssignmentState.CLOSED,
	type: AssignmentType.PROJECT,
	collaboration: CollaborationType.GROUP,
	points: null,
	bonusPoints: null,
	timespanDays: 90
};

export const ASSIGNMENT_TEMPLATES_MOCK: AssignmentTemplateDto[] = [
	ASSIGNMENT_TEMPLATE_GROUP_HW,
	ASSIGNMENT_TEMPLATE_TESTAT,
	ASSIGNMENT_TEMPLATE_PROJECT
];
