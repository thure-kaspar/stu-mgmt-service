import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CourseModule } from "../course/course.module";
import { CsvConverterService } from "./services/csv-converter.service";
import { CsvController } from "./controllers/csv.controller";
import { AdmissionStatusModule } from "../admission-status/admission-status.module";
import { AssessmentModule } from "../assessment/assessment.module";

@Module({
	imports: [AuthModule, CourseModule, AssessmentModule, AdmissionStatusModule],
	providers: [CsvConverterService],
	controllers: [CsvController]
})
export class CsvModule {}
