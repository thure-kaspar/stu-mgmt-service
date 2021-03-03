import { Module } from "@nestjs/common";
import { CourseModule } from "../course/course.module";
import { AuthModule } from "../auth/auth.module";
import { AdmissionStatusController } from "./admission-status.controller";
import { AdmissionStatusService } from "./admission-status.service";

@Module({
	imports: [AuthModule, CourseModule],
	controllers: [AdmissionStatusController],
	providers: [AdmissionStatusService],
	exports: [AdmissionStatusService]
})
export class AdmissionStatusModule {}
