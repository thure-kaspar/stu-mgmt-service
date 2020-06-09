import { Injectable, HttpService, Logger } from "@nestjs/common";
import { UpdateMessage } from "../../shared/dto/update-message.dto";

@Injectable()
export class UpdateService { 

	private readonly logger = new Logger(UpdateService.name);

	constructor(private http: HttpService) { }

	/**
	 * Sends the UpdateMessage via http-post to the URL specified by the course.
	 */
	send(url: string, message: UpdateMessage): void {
		if (url && message) {
			this.logger.verbose("Sending notification to: " + url);
			this.http.post(url, message).toPromise()
				.catch(err  => this.logger.error(err.message));
		}
	}

}
