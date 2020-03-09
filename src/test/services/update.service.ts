import { Injectable, HttpService } from "@nestjs/common";
import { UpdateMessage } from "../dto/update-message.dto";

@Injectable()
export class UpdateService { 

	private courseMap = new Map<string, string>(); // TODO: Create data structure to save urls

	constructor(private http: HttpService) {
		// this.courseMap.set("info2-sose2020", "www.INSERT-URL-HERE.test");
		// this.courseMap.set("java-wise1920", "www.INSERT-URL-HERE.test");
	}

	/**
	 * Sends the given message using http (POST), if the affected course has configured a url for update events.
	 */
	send(message: UpdateMessage): void {
		// Check, if the course has configured a url for update messages
		//const url = this.courseMap.get(message.courseId);
		if (message.url) {
			// Send message using http (POST)
			this.http.post(message.url, message);
		}
	}

}