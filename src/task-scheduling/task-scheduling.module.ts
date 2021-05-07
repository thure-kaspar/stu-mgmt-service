import { Module } from "@nestjs/common";
import { CourseModule } from "../course/course.module";
import { AuthModule } from "../auth/auth.module";
import { TaskSchedulingController } from "./task-scheduling.controller";
import { AssignmentSchedulerService } from "./assignment-scheduler.service";

@Module({
	imports: [AuthModule, CourseModule],
	// controllers: [TaskSchedulingController],
	providers: [AssignmentSchedulerService]
})
export class TaskSchedulingModule {}
