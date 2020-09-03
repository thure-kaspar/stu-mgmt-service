import { Injectable, Logger } from "@nestjs/common";
import { SchedulerRegistry, Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AssignmentUpdateDto } from "../course/dto/assignment/assignment.dto";
import { Assignment as AssignmentEntity } from "../course/entities/assignment.entity";
import { Assignment } from "../course/models/assignment.model";
import { Course } from "../course/models/course.model";
import { AssignmentRepository } from "../course/repositories/assignment.repository";
import { AssignmentService } from "../course/services/assignment.service";
import { AssignmentState } from "../shared/enums";

@Injectable()
export class AssignmentSchedulerService {

	private logger = new Logger(AssignmentSchedulerService.name);

	constructor(
		private schedulerRegistry: SchedulerRegistry,
		private assignmentService: AssignmentService,
		@InjectRepository(AssignmentEntity) private assignmentRepository: AssignmentRepository
	) { }

	@Cron("1 * * * *", { name: "startAssignments" })
	async startAssignments(): Promise<void> {
		this.logger.verbose("Starting job: 'startAssignments'");

		const assignments = await this.findAssignmentsThatShouldBeStarted();

		this.logger.debug(`Found ${assignments.length} that should be started.`);
		console.log(assignments.map(a => ({ name: a.name, state: a.state, startDate: a.startDate })));

		assignments.forEach(async a => {
			await this.tryUpdateAssignment(a, AssignmentState.IN_PROGRESS);
		});
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

	@Cron("1 * * * *", { name: "stopAssignments" })
	async stopAssignments(): Promise<void> {
		this.logger.verbose("Starting job: 'stopAssignments'");
		
		const assignments = await this.findAssignmentsThatShouldBeStopped();
		this.logger.debug(`Found ${assignments.length} that should be stopped.`);
		console.log(assignments.map(a => ({ name: a.name, state: a.state, startDate: a.startDate })));

		assignments.forEach(async a => {
			await this.tryUpdateAssignment(a, AssignmentState.IN_REVIEW);
		});
	}

	private async tryUpdateAssignment(a: AssignmentEntity, state: AssignmentState) {
		try {
			const assignment = new Assignment(a);
			const course = new Course(a.course);
			const update: AssignmentUpdateDto = { state };
			await this.assignmentService.updateAssignment(course, assignment, update);
			this.logger.verbose(`Set assignment ${a.name} (${a.id}) of course ${a.courseId} to ${state}.`);
		}
		catch (error) {
			this.logger.error(`Set assignment ${a.name} (${a.id}) of course ${a.courseId} to ${state}.`);
		}
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

}
