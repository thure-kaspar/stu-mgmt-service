import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CourseModule } from "../course/course.module";
import { AssignmentSchedulerService } from "./assignment-scheduler.service";
import { Assignment } from "src/course/entities/assignment.entity";
import { AssignmentRepository } from "src/course/repositories/assignment.repository";

@Module({
	imports: [AuthModule, CourseModule, Assignment],
	providers: [AssignmentSchedulerService, AssignmentRepository]
	// controllers: [TaskSchedulingController] // Only used for testing purposes
})
export class TaskSchedulingModule {}
