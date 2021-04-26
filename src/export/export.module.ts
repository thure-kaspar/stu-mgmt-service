import { Module } from "@nestjs/common";
import { AdmissionStatusModule } from "../admission-status/admission-status.module";
import { CourseModule } from "../course/course.module";
import { ExportController } from "./export.controller";

@Module({
	imports: [CourseModule, AdmissionStatusModule],
	controllers: [ExportController]
})
export class ExportModule {}
