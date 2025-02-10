import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AssessmentRepository } from "../assessment/repositories/assessment.repository";
import { AuthModule } from "../auth/auth.module";
import { CourseModule } from "../course/course.module";
import { ParticipantRepository } from "../course/repositories/participant.repository";
import { MailingController } from "./mailing.controller";
import { Services } from "./services";
import { MailingService } from "./services/mailing.service";
import { Participant } from "src/course/entities/participant.entity";
import { MailingListener } from "./services/mailing-listener.service";

@Module({
	controllers: [MailingController],
	imports: [
		AuthModule,
		CourseModule,
		TypeOrmModule.forFeature([ParticipantRepository, AssessmentRepository, Participant])
	],
	providers: [...Services, ParticipantRepository],
	exports: [MailingService]
})
export class MailingModule {}
