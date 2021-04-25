import { HttpModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationController } from "./notification.controller";
import { NotificationSaga } from "./notification.saga";
import { NotificationService } from "./notification.service";
import { SubscriberRepository } from "./subscriber/subscriber.repository";

@Module({
	imports: [CqrsModule, HttpModule, TypeOrmModule.forFeature([SubscriberRepository])],
	providers: [NotificationSaga, NotificationService],
	controllers: [NotificationController]
})
export class NotificationModule {}
