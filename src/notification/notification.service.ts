import { HttpService, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationDto } from "../shared/dto/notification.dto";
import { Subscriber } from "./subscriber/subscriber.entity";
import { SubscriberRepository } from "./subscriber/subscriber.repository";

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name);

	constructor(
		private http: HttpService,
		@InjectRepository(Subscriber) private subscriberRepository: SubscriberRepository
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
			this.logger.verbose("Sending notification to: " + sub.url);
			this.http
				.post(sub.url, notification)
				.toPromise()
				.catch(err => this.logger.error(err.message));
		});
	}
}
