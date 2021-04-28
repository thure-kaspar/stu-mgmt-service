export enum Severity {
	INFORMATIONAL = "INFO",
	HINT = "HINT",
	WARNING = "WARNING",
	ERROR = "ERROR"
}

export class MarkerDto {
	path: string;
	startLineNumber: number;
	endLineNumber: number;
	startColumn?: number;
	endColumn?: number;
	severity: Severity;
	comment: string;
	points?: number;
}
