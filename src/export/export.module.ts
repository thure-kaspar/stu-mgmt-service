import { Module } from "@nestjs/common";
import { AdmissionStatusModule } from "../admission-status/admission-status.module";
import { AssessmentModule } from "../assessment/assessment.module";
import { AuthModule } from "../auth/auth.module";
import { CourseModule } from "../course/course.module";
import { ExportController } from "./export.controller";
import { ExportService } from "./export.service";
import { RecommenderExportService } from "./recommender-export.service";

@Module({
	imports: [AuthModule, CourseModule, AssessmentModule, AdmissionStatusModule],
	controllers: [ExportController],
	providers: [ExportService, RecommenderExportService]
})
export class ExportModule {}
