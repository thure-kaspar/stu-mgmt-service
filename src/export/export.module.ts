import { Module } from "@nestjs/common";
import { AdmissionStatusModule } from "../admission-status/admission-status.module";
import { AssessmentModule } from "../assessment/assessment.module";
import { AuthModule } from "../auth/auth.module";
import { CourseModule } from "../course/course.module";
import { ExportController } from "./export.controller";
import { ExportService } from "./export.service";
import { RecommenderExportService } from "./recommender-export.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Assessment } from "src/assessment/entities/assessment.entity";
import { AssessmentRepository } from "src/assessment/repositories/assessment.repository";

@Module({
	imports: [TypeOrmModule.forFeature([Assessment]), AuthModule, CourseModule, AssessmentModule, AdmissionStatusModule],
	controllers: [ExportController],
	providers: [ExportService, RecommenderExportService, AssessmentRepository]
})
export class ExportModule {}
