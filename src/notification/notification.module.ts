import { HttpModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationController } from "./notification.controller";
import { NotificationSaga } from "./notification.saga";
import { NotificationService } from "./notification.service";
import { SubscriberRepository } from "./subscriber/subscriber.repository";
import * as config from "config";

function optionalProviders(): any[] {
	const providers = [];

	const notificationConfig = config.get("notifications");
	if (notificationConfig?.enabled) {
		providers.push(NotificationSaga);
	}

	return providers;
}

@Module({
	imports: [CqrsModule, HttpModule, TypeOrmModule.forFeature([SubscriberRepository])],
	providers: [NotificationService, ...optionalProviders()],
	controllers: [NotificationController]
})
export class NotificationModule {}
