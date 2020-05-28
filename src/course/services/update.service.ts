import { Injectable, HttpService, Logger } from "@nestjs/common";
import { UpdateMessage } from "../../shared/dto/update-message.dto";

@Injectable()
export class UpdateService { 

	static instance: UpdateService;

	private readonly logger = new Logger(UpdateService.name);

	constructor(private http: HttpService) {
		UpdateService.instance = this;
	}

	/**
	 * Sends the UpdateMessage via http-post to the URL specified by the course.
	 */
	send(message: UpdateMessage): void {
		//this.logger.verbose("[disabled] Sending update to: <URL>");
		if (message.courseId === "java-sose2020") {
			this.http.post("http://127.0.0.1:1111/rest/update", message).toPromise();
		}
	}

}
