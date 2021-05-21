import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AssessmentRepository } from "../assessment/repositories/assessment.repository";
import { AuthModule } from "../auth/auth.module";
import { CourseModule } from "../course/course.module";
import { ParticipantRepository } from "../course/repositories/participant.repository";
import { MailingController } from "./mailing.controller";
import { Services } from "./services";
import { MailingService } from "./services/mailing.service";

@Module({
	controllers: [MailingController],
	imports: [
		AuthModule,
		CourseModule,
		TypeOrmModule.forFeature([ParticipantRepository, AssessmentRepository])
	],
	providers: [...Services],
	exports: [MailingService]
})
export class MailingModule {}
