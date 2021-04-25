import { NotificationDto } from "../../shared/dto/notification.dto";

export interface INotify {
	toNotificationDto(): NotificationDto;
}
