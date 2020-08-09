import { HttpModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { UserRepository } from "../user/repositories/user.repository";
import { Controllers } from "./controllers";
import { AssessmentEvent } from "./entities/assessment-event.entity";
import { EventHandlers, EventNotificationHandlers } from "./events";
import { Guards } from "./guards";
import { QueryHandlers } from "./queries";
import { Repositories } from "./repositories";
import { Services } from "./services";

@Module({
	imports: [
		TypeOrmModule.forFeature([...Repositories, UserRepository, AssessmentEvent]),
		CqrsModule,
		HttpModule,
		AuthModule
	],
	controllers: [...Controllers],
	providers: [
		...Services,
		...Guards,
		...EventHandlers,
		...EventNotificationHandlers,
		...QueryHandlers
	]
})
export class CourseModule { }
