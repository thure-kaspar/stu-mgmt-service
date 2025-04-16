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
import { Assignment } from "src/course/entities/assignment.entity";
import { AssignmentRepository } from "src/course/repositories/assignment.repository";
import { Assessment } from "./entities/assessment.entity";
import { AssessmentRepository } from "./repositories/assessment.repository";
import { AssignmentRegistration } from "src/course/entities/assignment-group-registration.entity";
import { AssignmentRegistrationRepository } from "src/course/repositories/assignment-registration.repository";

@Module({
	imports: [
		TypeOrmModule.forFeature([...Repositories, AssessmentEvent, AssignmentRegistration]),
		CqrsModule,
		AuthModule,
		CourseModule,
		Assignment,
		Assessment
	],
	providers: [...Services, ...QueryHandlers, 
		AssessmentScoreChangedHandler, AssignmentRepository, 
		AssessmentRepository, AssignmentRegistrationRepository],
	controllers: [...Controllers],
	exports: [...Services]
})
export class AssessmentModule {}
