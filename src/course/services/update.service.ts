import { Injectable, HttpService, Logger } from "@nestjs/common";

export enum EventType {
	INSERT = "INSERT",
	UPDATE = "UPDATE",
	REMOVE = "REMOVE"
}

export enum AffectedObject {
	USER = "USER",
	GROUP = "GROUP",
	USER_GROUP_RELATION = "USER_GROUP_RELATION",
	COURSE_USER_RELATION = "COURSE_USER_RELATION",
	ASSIGNMENT = "ASSIGNMENT"
}

export class UpdateMessage {
	type: EventType;
	affectedObject: AffectedObject;
	courseId: string;
	entityId: string;
	entityId_relation?: string;
	date?: Date; 
}

@Injectable()
export class UpdateService { 

	private http: HttpService;
	private readonly logger = new Logger(UpdateService.name);

	constructor() {
		this.http = new HttpService();
	}

	/**
	 * Sends the UpdateMessage via http-post to the URL specified by the course.
	 */
	send(message: UpdateMessage): void {
		this.logger.log("[diabled] Sending update to: <URL>");
		//this.http.post("INSERT-URL-HERE", message).toPromise();
	}

}
