import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { CourseModule } from "../course/course.module";
import { Controllers } from "./controllers";
import { AssessmentEvent } from "./entities/assessment-event.entity";
import { AssessmentScoreChangedHandler } from "./events/assessment-score-changed.event";
import { QueryHandlers } from "./queries";
import { Repositories } from "./repositories";
import { Services } from "./services";

@Module({
	imports: [
		TypeOrmModule.forFeature([...Repositories, AssessmentEvent]),
		CqrsModule,
		AuthModule,
		CourseModule
	],
	providers: [...Services, ...QueryHandlers, AssessmentScoreChangedHandler],
	controllers: [...Controllers],
	exports: [...Services]
})
export class AssessmentModule {}
