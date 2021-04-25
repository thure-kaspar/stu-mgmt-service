import { Injectable } from "@nestjs/common";
import { Saga } from "@nestjs/cqrs";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { INotify } from "../course/events/interfaces";
import { NotificationService } from "./notification.service";

@Injectable()
export class NotificationSaga {
	@Saga()
	saga = (events$: Observable<INotify>): Observable<any> => {
		return events$.pipe(
			tap(event => {
				if (typeof event.toNotificationDto === "function") {
					this.notificationService.notifySubscribers(event.toNotificationDto());
				}
			}),
			map(event => undefined)
		);
	};

	constructor(private notificationService: NotificationService) {}
}
