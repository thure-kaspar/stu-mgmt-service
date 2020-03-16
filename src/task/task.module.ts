import { Module, HttpModule, HttpService } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UpdateMessageRepository } from "./database/repositories/update-message.repository";
import { UpdateService } from "./tasks/update.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([UpdateMessageRepository]),
		HttpModule
	],
	providers: [UpdateService]
})
export class TaskModule {}
