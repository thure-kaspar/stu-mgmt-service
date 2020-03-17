import { Injectable, HttpService, Logger } from "@nestjs/common";
import { UpdateMessage } from "../../shared/dto/update-message.dto";

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
