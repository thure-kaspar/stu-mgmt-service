import { Injectable, HttpService, Logger } from "@nestjs/common";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { UpdateMessageRepository } from "../database/repositories/update-message.repository";
import { InjectRepository } from "@nestjs/typeorm";

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

export class UpdateMessageDto {
	type: EventType;
	affectedObject: AffectedObject;
	courseId: string;
	entityId: string;
	entityId_relation?: string;
	date?: Date; 
}

@Injectable()
export class UpdateService { 

	private readonly logger = new Logger(UpdateService.name);

	private courseMap = new Map<string, string>(); // TODO: Create data structure to save urls

	constructor(private http: HttpService) {
		// this.courseMap.set("info2-sose2020", "www.INSERT-URL-HERE.test");
		// this.courseMap.set("java-wise1920", "www.INSERT-URL-HERE.test");
	}

	/**
	 * Sends the given message using http (POST), if the affected course has configured a url for update events.
	 */
	@Cron(CronExpression.EVERY_10_SECONDS, { name: "UpdateMessageJob" })
	send(): void {
		this.logger.log("Job running: send");
	}

}