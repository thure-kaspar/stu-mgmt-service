import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationDto } from "../shared/dto/notification.dto";
import { SubscriberRepository } from "./subscriber/subscriber.repository";

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name);

	constructor(
		private http: HttpService,
		@InjectRepository(SubscriberRepository) private subscriberRepository: SubscriberRepository
	) {}

	/**
	 * Sends the NotificationDto via http-post to subscribers.
	 */
	async notifySubscribers(notification: NotificationDto): Promise<void> {
		const allSubscribers = await this.subscriberRepository.getSubscribersOfCourse(
			notification.courseId
		);

		const subscribers = allSubscribers.filter(
			sub => sub.events.ALL || sub.events[notification.event]
		);

		subscribers.forEach(sub => {
			this.logger.verbose(
				`[${notification.event}] Sending notification to "${sub.name}" at ${sub.url}`
			);
			this.http
				.post(sub.url, notification)
				.toPromise()
				.catch(err =>
					this.logger.error(
						`Failed to notify "${sub.name}" at ${sub.url} - ${err.message}`
					)
				);
		});
	}
}
