export class EventDto {
	event: string;
	timestamp: Date;
	payload?: Record<string, unknown>;
}
