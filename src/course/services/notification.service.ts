import { HttpService, Injectable, Logger } from "@nestjs/common";
import { NotificationDto } from "../../shared/dto/notification.dto";
import * as config from "config";

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name);
	private urls: string[] = config.get("notifications.java");

	constructor(private http: HttpService) {
		if (this.urls) {
			this.logger.verbose(`Notifications will be send to:\n${this.urls.join("\n")}`);
		}
	}

	/**
	 * Sends the UpdateMessage via http-post to the URLs specified in the config (notifications > java).
	 */
	send(notification: NotificationDto): void {
		this.urls?.forEach(url => {
			this.logger.verbose("Sending notification to: " + url);
			this.http
				.post(url, notification)
				.toPromise()
				.catch(err => this.logger.error(err.message));
		});
	}
}
