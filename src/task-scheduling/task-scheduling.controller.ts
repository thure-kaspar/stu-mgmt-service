import { Controller } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AssignmentSchedulerService } from "./assignment-scheduler.service";

@ApiBearerAuth()
@ApiTags("task-scheduler")
@Controller("task-scheduler")
export class TaskSchedulingController {
	constructor(
		private schedulerRegistry: SchedulerRegistry,
		private assignmentScheduler: AssignmentSchedulerService
	) {}
}
