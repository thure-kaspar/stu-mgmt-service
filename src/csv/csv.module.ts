import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CourseModule } from "../course/course.module";
import { CsvConverterService } from "./services/csv-converter.service";
import { CsvController } from "./controllers/csv.controller";
import { AdmissionStatusModule } from "../admission-status/admission-status.module";

@Module({
	imports: [AuthModule, CourseModule, AdmissionStatusModule],
	providers: [CsvConverterService],
	controllers: [CsvController]
})
export class CsvModule {}
