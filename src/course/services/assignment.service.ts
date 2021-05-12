import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { DtoFactory } from "../../shared/dto-factory";
import { AssignmentDto, AssignmentUpdateDto } from "../dto/assignment/assignment.dto";
import { AssignmentId } from "../entities/assignment.entity";
import { CourseId } from "../entities/course.entity";
import { AssignmentCreated } from "../events/assignment/assignment-created.event";
import { AssignmentRemoved } from "../events/assignment/assignment-removed.event";
import { AssignmentStateChanged } from "../events/assignment/assignment-state-changed.event";
import { AssignmentUpdated } from "../events/assignment/assignment-updated.event";
import { Assignment } from "../models/assignment.model";
import { Course } from "../models/course.model";
import { AssignmentRepository } from "../repositories/assignment.repository";
import { AssignmentRegistrationService } from "./assignment-registration.service";

@Injectable()
export class AssignmentService {
	constructor(
		@InjectRepository(Assignment) private assignmentRepository: AssignmentRepository,
		private registrations: AssignmentRegistrationService,
		private events: EventBus
	) {}

	async createAssignment(course: Course, assignmentDto: AssignmentDto): Promise<AssignmentDto> {
		const createdAssignment = await this.assignmentRepository.createAssignment(
			course.id,
			assignmentDto
		);

		const assignment = new Assignment(createdAssignment);
		this.events.publish(new AssignmentCreated(course.id, assignment.id));

		if (assignment.wasStarted() && assignment.allowsGroups()) {
			await this.registrations.registerGroupsForAssignment(course, assignment.id);
		}

		return DtoFactory.createAssignmentDto(createdAssignment);
	}

	async getAssignments(courseId: CourseId): Promise<AssignmentDto[]> {
		const assignments = await this.assignmentRepository.getAssignments(courseId);
		const assignmentDtos = assignments.map(a => DtoFactory.createAssignmentDto(a));
		return assignmentDtos;
	}

	async getAssignmentById(assignmentId: string): Promise<AssignmentDto> {
		const assignment = await this.assignmentRepository.getAssignmentById(assignmentId);
		return DtoFactory.createAssignmentDto(assignment);
	}

	/**
	 * Partially updates the assessment.
	 * If the assignment is set to `IN_PROGRESS` for the first time, groups and their members
	 * will be registered for this assignment, assuming the assignment allows groups.
	 */
	async updateAssignment(
		course: Course,
		assignment: Assignment,
		update: AssignmentUpdateDto
	): Promise<AssignmentDto> {
		const updated = await this.assignmentRepository.updateAssignment(assignment.id, update);
		const oldState = assignment.state;
		assignment = new Assignment(updated);

		if (assignment.wasStarted(oldState) && assignment.allowsGroups()) {
			const isFirstStart = !(await this.registrations.hasRegistrations(assignment.id));
			if (isFirstStart) {
				await this.registrations.registerGroupsForAssignment(course, assignment.id);
			}
		}

		this.events.publish(new AssignmentUpdated(course.id, assignment.id));

		if (assignment.hasChangedState(oldState)) {
			this.events.publish(new AssignmentStateChanged(assignment));
		}

		return DtoFactory.createAssignmentDto(updated);
	}

	async deleteAssignment(courseId: CourseId, assignmentId: AssignmentId): Promise<boolean> {
		const deleted = await this.assignmentRepository.deleteAssignment(assignmentId);
		if (deleted) {
			this.events.publish(new AssignmentRemoved(courseId, assignmentId));
		}
		return deleted;
	}
}
