export enum Severity {
	INFORMATIONAL = "INFORMATIONAL",
	WARNING = "WARNING",
	ERROR = "ERROR",
	CRITICAL = "CRITICAL"
}

export class PartialAssessmentDto {
	id?: number;
	assessmentId: string;
	title: string;
	type?: string;
	severity?: Severity;
	points?: number;
	comment?: string;
	path?: string;
	line?: number;
}
