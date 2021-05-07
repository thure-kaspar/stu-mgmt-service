import { Controller, UseGuards, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation } from "@nestjs/swagger";
import { SchedulerRegistry } from "@nestjs/schedule";
import { AssignmentSchedulerService } from "./assignment-scheduler.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../shared/enums";
import { AuthGuard } from "../auth/guards/auth.guard";

class JobInfoDto {
	jobName: string;
	lastDate: string;
	nextDate: string;
}

@ApiBearerAuth()
@ApiTags("task-scheduler")
@Controller("task-scheduler")
@UseGuards(AuthGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class TaskSchedulingController {
	constructor(
		private schedulerRegistry: SchedulerRegistry,
		private assignmentScheduler: AssignmentSchedulerService
	) {}

	@ApiOperation({
		operationId: "start_startAssignments",
		summary: "Restarts a job that has been stopped.",
		description: "Requires role: SYSTEM_ADMIN"
	})
	@Post("assignment-scheduler/start-assignments/start")
	start_startAssignments(): void {
		const startAssignments = this.schedulerRegistry.getCronJob("startAssignments");
		startAssignments.start();
	}

	@ApiOperation({
		operationId: "stop_startAssignments",
		summary: "Stop a job that is scheduled to run.",
		description: "Requires role: SYSTEM_ADMIN"
	})
	@Post("assignment-scheduler/start-assignments/stop")
	stop_StartAssignments(): void {
		const startAssignments = this.schedulerRegistry.getCronJob("startAssignments");
		startAssignments.stop();
	}

	@ApiOperation({
		operationId: "setTime_startAssignments",
		summary: "Stop a job that is scheduled to run.",
		description: "Requires role: SYSTEM_ADMIN"
	})
	@Post("assignment-scheduler/start-assignments/set-time")
	setTime_StartAssignments(time: { crontime: string }): void {
		const startAssignments = this.schedulerRegistry.getCronJob("startAssignments");
		startAssignments.setTime(time.crontime);
	}

	@ApiOperation({
		operationId: "getAssignmentSchedulerInfo",
		summary: "Get information about assignment jobs.",
		description: "Returns information about jobs of the assignment scheduler."
	})
	@Get("assignment-scheduler")
	getAssignmentSchedulerInfo(): JobInfoDto[] {
		const startAssignments = this.schedulerRegistry.getCronJob("startAssignments");
		const stopAssignments = this.schedulerRegistry.getCronJob("stopAssignments");

		return [
			{
				jobName: "startAssignments",
				lastDate: (startAssignments.lastDate() as Date)?.toLocaleString(),
				nextDate: startAssignments.nextDate(1)[0]
			},
			{
				jobName: "stopAssignments",
				lastDate: (stopAssignments.lastDate() as Date)?.toLocaleString(),
				nextDate: stopAssignments.nextDate(1)[0]
			}
		];
	}
}
