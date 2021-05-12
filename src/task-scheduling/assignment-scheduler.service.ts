import { Injectable, Logger } from "@nestjs/common";
import { ofType, Saga } from "@nestjs/cqrs";
import { SchedulerRegistry, Timeout } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AssignmentUpdateDto } from "../course/dto/assignment/assignment.dto";
import { Assignment as AssignmentEntity } from "../course/entities/assignment.entity";
import { AssignmentCreated } from "../course/events/assignment/assignment-created.event";
import { AssignmentRemoved } from "../course/events/assignment/assignment-removed.event";
import { AssignmentUpdated } from "../course/events/assignment/assignment-updated.event";
import { Assignment } from "../course/models/assignment.model";
import { Course } from "../course/models/course.model";
import { AssignmentRepository } from "../course/repositories/assignment.repository";
import { AssignmentService } from "../course/services/assignment.service";
import { AssignmentState } from "../shared/enums";

const JOB_NEXT_ASSIGNMENT_START = "nextAssignmentStart";
const JOB_NEXT_ASSIGNMENT_STOP = "nextAssignmentStop";

@Injectable()
export class AssignmentSchedulerService {
	private logger = new Logger(AssignmentSchedulerService.name);

	@Saga()
	saga = (events$: Observable<unknown>): Observable<void> => {
		return events$.pipe(
			ofType(AssignmentCreated, AssignmentUpdated, AssignmentRemoved),
			tap(() => {
				this.scheduleNextStartAndStop();
			}),
			map(() => undefined)
		);
	};

	constructor(
		private schedulerRegistry: SchedulerRegistry,
		private assignmentService: AssignmentService,
		@InjectRepository(AssignmentEntity) private assignmentRepository: AssignmentRepository
	) {}

	@Timeout("onInit", 0) // Executes after application start
	async onInit(): Promise<void> {
		await Promise.all([
			this.startAssignments(),
			this.stopAssignments(),
			this.scheduleNextStartAndStop()
		]);

		this.schedulerRegistry.deleteTimeout("onInit");
	}

	async startAssignments(): Promise<void> {
		this.logger.verbose("Starting job: 'startAssignments'");

		const assignments = await this.findAssignmentsThatShouldBeStarted();

		this.logger.debug(`Found ${assignments.length} that should be started.`);

		if (assignments.length > 0) {
			console.log(
				assignments.map(a => ({ name: a.name, state: a.state, startDate: a.startDate }))
			);

			assignments.forEach(async a => {
				await this.tryUpdateAssignment(a, AssignmentState.IN_PROGRESS);
			});
		}
	}

	async stopAssignments(): Promise<void> {
		this.logger.verbose("Starting job: 'stopAssignments'");

		const assignments = await this.findAssignmentsThatShouldBeStopped();
		this.logger.debug(`Found ${assignments.length} that should be stopped.`);

		if (assignments.length > 0) {
			console.log(
				assignments.map(a => ({ name: a.name, state: a.state, endDate: a.endDate }))
			);

			assignments.forEach(async a => {
				await this.tryUpdateAssignment(a, AssignmentState.IN_REVIEW);
			});
		}
	}

	private findAssignmentsThatShouldBeStarted(): Promise<AssignmentEntity[]> {
		return this.assignmentRepository.find({
			where: {
				state: AssignmentState.INVISIBLE,
				startDate: LessThanOrEqual(new Date())
			},
			relations: ["course"]
		});
	}

	private findAssignmentsThatShouldBeStopped(): Promise<AssignmentEntity[]> {
		return this.assignmentRepository.find({
			where: {
				state: AssignmentState.IN_PROGRESS,
				endDate: LessThanOrEqual(new Date())
			},
			relations: ["course"]
		});
	}

	private async tryUpdateAssignment(a: AssignmentEntity, state: AssignmentState) {
		try {
			const assignment = new Assignment(a);
			const course = new Course(a.course);
			const update: AssignmentUpdateDto = { state };
			await this.assignmentService.updateAssignment(course, assignment, update);
			this.logger.verbose(
				`Set assignment ${a.name} (${a.id}) of course ${a.courseId} to ${state}.`
			);
		} catch (error) {
			this.logger.error(
				`Failed to set assignment ${a.name} (${a.id}) of course ${a.courseId} to ${state}.`
			);
		}
	}

	/**
	 * Searches for the next assignments that should be started and stopped and schedules a `CronJob`
	 * that will trigger the corresponding update.
	 */
	async scheduleNextStartAndStop(): Promise<void> {
		const [nextStarting, nextStopping] = await Promise.all([
			this.getNextStartingAssignment(),
			this.getNextStoppingAssignment()
		]);

		this.updateJob(JOB_NEXT_ASSIGNMENT_START, nextStarting, "startDate", () => {
			this.startAssignments();
		});

		this.updateJob(JOB_NEXT_ASSIGNMENT_STOP, nextStopping, "endDate", () => {
			this.stopAssignments();
		});
	}

	/**
	 * Schedules the next run of a `CronJob` or removes it, if `next` is undefined.
	 */
	private updateJob(
		jobName: string,
		next: AssignmentEntity | undefined,
		byDate: "startDate" | "endDate",
		cb: () => void
	) {
		if (next) {
			this.scheduleNext(jobName, next, next[byDate], cb);
		} else {
			this.removeTimeout(jobName);
		}
	}

	/**
	 * Adds a `CronJob` or updates the time of the next run.
	 */
	private scheduleNext(jobName: string, next: AssignmentEntity, date: Date, cb: () => void) {
		const action = jobName === JOB_NEXT_ASSIGNMENT_START ? "start" : "stop";

		this.removeTimeout(jobName);

		this.schedulerRegistry.addTimeout(
			jobName,
			setTimeout(cb, date.getTime() - new Date().getTime())
		);

		this.logger.debug(`Scheduling ${next.name} to ${action} at ${date.toLocaleString()}.`);
	}

	private removeTimeout(jobName: string) {
		try {
			this.schedulerRegistry.deleteTimeout(jobName);
		} catch (error) {
			// ignore exception when timeout does not exist
		}
	}

	private async getNextStartingAssignment(): Promise<AssignmentEntity | undefined> {
		return this.findNextAssignment("startDate", AssignmentState.INVISIBLE);
	}

	private async getNextStoppingAssignment(): Promise<AssignmentEntity | undefined> {
		return this.findNextAssignment("endDate");
	}

	private async findNextAssignment(
		byDate: "startDate" | "endDate",
		state?: AssignmentState
	): Promise<AssignmentEntity | undefined> {
		// Only include state in "where" when defined, because undefined will not work
		const whereState = state ? { state } : {};

		const [next] = await this.assignmentRepository.find({
			where: {
				[byDate]: MoreThanOrEqual(new Date()),
				...whereState
			},
			order: byDate === "startDate" ? { startDate: "ASC" } : { endDate: "ASC" },
			take: 1
		});

		return next;
	}
}
