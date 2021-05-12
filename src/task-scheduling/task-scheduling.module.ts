import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CourseModule } from "../course/course.module";
import { AssignmentSchedulerService } from "./assignment-scheduler.service";
import { TaskSchedulingController } from "./task-scheduling.controller";

@Module({
	imports: [AuthModule, CourseModule],
	providers: [AssignmentSchedulerService]
	// controllers: [TaskSchedulingController] // Only used for testing purposes
})
export class TaskSchedulingModule {}
