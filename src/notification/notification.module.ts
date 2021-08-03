import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Config } from "../.config/config";
import { NotificationController } from "./notification.controller";
import { NotificationSaga } from "./notification.saga";
import { NotificationService } from "./notification.service";
import { SubscriberRepository } from "./subscriber/subscriber.repository";

function optionalProviders(): any[] {
	const providers = [];

	if (Config.getNotifications().enabled) {
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
