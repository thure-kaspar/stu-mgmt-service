import { Module } from "@nestjs/common";
import { CourseModule } from "../course/course.module";
import { AuthModule } from "../auth/auth.module";
import { AdmissionStatusController } from "./admission-status.controller";
import { AdmissionStatusService } from "./admission-status.service";
import { ParticipantRepository } from "src/course/repositories/participant.repository";
import { AdmissionCriteria } from "src/course/entities/admission-criteria.entity";
import { AdmissionCriteriaRepository } from "src/course/repositories/admission-criteria.repository";
import { AdmissionFromPreviousSemester } from "src/course/entities/admission-from-previous-semester.entity";
import { AdmissionFromPreviousSemesterRepository } from "src/course/repositories/admission-from-previous-semester.repository";

@Module({
	imports: [AuthModule, CourseModule, AdmissionCriteria, AdmissionFromPreviousSemester],
	controllers: [AdmissionStatusController],
	providers: [AdmissionStatusService, ParticipantRepository, AdmissionCriteriaRepository, AdmissionFromPreviousSemesterRepository],
	exports: [AdmissionStatusService]
})
export class AdmissionStatusModule {}
