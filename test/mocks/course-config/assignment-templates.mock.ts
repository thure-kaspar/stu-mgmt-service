import { AssignmentTemplateDto } from "../../../src/course/dto/assignment-template.dto";
import { CollaborationType, AssignmentType } from "../../../src/shared/enums";

export const ASSIGNMENT_TEMPLATE_GROUP_HW: AssignmentTemplateDto = {
	id: 1,
	name: "Hausaufgabe-Template",
	titleSchema: "Hausaufgabe",
	type: AssignmentType.HOMEWORK,
	collaboration: CollaborationType.GROUP,
	points: 100,
	bonusPoints: 10
};

export const ASSIGNMENT_TEMPLATE_TESTAT: AssignmentTemplateDto = {
	id: 2,
	name: "Testat-Template",
	titleSchema: "Testat",
	type: AssignmentType.TESTAT,
	collaboration: CollaborationType.SINGLE,
	points: 100,
	bonusPoints: null
};

export const ASSIGNMENT_TEMPLATE_PROJECT: AssignmentTemplateDto = {
	id: 3,
	name: "Projekt-Template",
	titleSchema: "Projekt",
	type: AssignmentType.PROJECT,
	collaboration: CollaborationType.GROUP,
	points: null,
	bonusPoints: null
};

export const ASSIGNMENT_TEMPLATES_MOCK: AssignmentTemplateDto[] = [
	ASSIGNMENT_TEMPLATE_GROUP_HW,
	ASSIGNMENT_TEMPLATE_TESTAT,
	ASSIGNMENT_TEMPLATE_PROJECT
];
