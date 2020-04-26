import { AssignmentTemplateDto } from "../../../src/course/dto/assignment-template.dto";
import { CollaborationType, AssignmentType } from "../../../src/shared/enums";

export const ASSIGNMENT_TEMPLATE_GROUP_HW: AssignmentTemplateDto = {
	id: 1,
	templateName: "Hausaufgabe-Template",
	name: "Hausaufgabe",
	type: AssignmentType.HOMEWORK,
	collaboration: CollaborationType.GROUP,
	points: 100,
	bonusPoints: 10
};

export const ASSIGNMENT_TEMPLATE_TESTAT: AssignmentTemplateDto = {
	id: 2,
	templateName: "Testat-Template",
	name: "Testat",
	type: AssignmentType.TESTAT,
	collaboration: CollaborationType.SINGLE,
	points: 100,
	bonusPoints: null
};

export const ASSIGNMENT_TEMPLATE_PROJECT: AssignmentTemplateDto = {
	id: 3,
	templateName: "Projekt-Template",
	name: "Projekt",
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
