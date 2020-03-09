import { Module, HttpModule } from '@nestjs/common';
import { NotificationsController } from './controllers/notifications.controller';
import { UpdateService } from "./services/update.service";

@Module({
  controllers: [NotificationsController],
  imports: [HttpModule],
  providers: [UpdateService]
})
export class TestModule {}
