import { Injectable } from "@nestjs/common";
import { Saga } from "@nestjs/cqrs";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { INotify } from "../course/events/interfaces";
import { NotificationService } from "./notification.service";

/**
 * Listens to the `EventBus` event-stream and triggers the `NotificationService` for events that
 * implement the `INotify` interface.
 */
@Injectable()
export class NotificationSaga {
	@Saga()
	saga = (events$: Observable<INotify>): Observable<undefined> => {
		return events$.pipe(
			tap(event => {
				if (typeof event.toNotificationDto === "function") {
					this.notificationService.notifySubscribers(event.toNotificationDto());
				}
			}),
			map(() => undefined)
		);
	};

	constructor(private notificationService: NotificationService) {}
}
