import { Module, HttpModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CqrsModule } from "@nestjs/cqrs";
import { AuthModule } from "../auth/auth.module";
import { QueryHandlers } from "./queries";
import { EventHandlers } from "./events";
import { Repositories } from "./repositories";
import { Controllers } from "./controllers";
import { Services } from "./services";
import { Guards } from "./guards";
import { UserRepository } from "../user/repositories/user.repository";
import { AssessmentEvent } from "./entities/assessment-event.entity";
import { ParticipantEntity } from "./entities/participant.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([...Repositories, ParticipantEntity, UserRepository, AssessmentEvent]),
		CqrsModule,
		HttpModule,
		AuthModule
	],
	controllers: [...Controllers],
	providers: [
		...Services,
		...Guards,
		...EventHandlers,
		...QueryHandlers
	]
})
export class CourseModule { }
