import { Module, HttpModule } from "@nestjs/common";
import { NotificationsController } from "./controllers/notifications.controller";

@Module({
	controllers: [NotificationsController],
	imports: [HttpModule],
	providers: []
})
export class TestModule {}
