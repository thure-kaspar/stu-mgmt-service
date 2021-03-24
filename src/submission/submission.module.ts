import { Module } from "@nestjs/common";
import { SubmissionService } from "./submission.service";
import { SubmissionController } from "./submission.controller";
import { Submission } from "./submission.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CourseModule } from "../course/course.module";
import { AuthModule } from "../auth/auth.module";

@Module({
	imports: [TypeOrmModule.forFeature([Submission]), AuthModule, CourseModule],
	controllers: [SubmissionController],
	providers: [SubmissionService]
})
export class SubmissionModule {}
