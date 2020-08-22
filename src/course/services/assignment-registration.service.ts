import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { UserId } from "../../shared/entities/user.entity";
import { AssignmentRegistrationFilter } from "../dto/assignment/assignment-registration.filter";
import { GroupDto } from "../dto/group/group.dto";
import { AssignmentRegistration } from "../entities/assignment-group-registration.entity";
import { AssignmentId } from "../entities/assignment.entity";
import { CourseId } from "../entities/course.entity";
import { Group, GroupId } from "../entities/group.entity";
import { GroupUnregistered } from "../events/assignment/group-unregistered.event";
import { UserRegistered } from "../events/assignment/user-registered.event";
import { UserUnregistered } from "../events/assignment/user-unregistered.event";
import { Course } from "../models/course.model";
import { Participant } from "../models/participant.model";
import { AssignmentRegistrationRepository } from "../repositories/assignment-registration.repository";
import { GroupRepository } from "../repositories/group.repository";
import { AlreadyInGroupException } from "../exceptions/custom-exceptions";

@Injectable()
export class AssignmentRegistrationService {

	constructor(@InjectRepository(AssignmentRegistration) private registrations: AssignmentRegistrationRepository,
				@InjectRepository(Group) private groups: GroupRepository,
				private events: EventBus) { }

	/**
	 * Registers the current groups of a course and their members for this assignment.
	 */
	async registerGroupsForAssignment(courseId: CourseId, assignmentId: AssignmentId): Promise<void> {
		const [groups] = await this.groups.getGroupsOfCourse(courseId);
		await this.registrations.createRegistrations(assignmentId, groups);
	}

	/**
	 * Registers an individual participant for the assignment as member of the specified group.
	 */
	async registerUserToGroup(course: Course, assignmentId: AssignmentId, groupId: GroupId, selectedParticipant: Participant): Promise<void> {
		const isAlreadyRegistered = await this.registrations.tryGetRegisteredGroupOfUser(assignmentId, selectedParticipant.userId);

		if (isAlreadyRegistered) {
			throw new AlreadyInGroupException(selectedParticipant.userId, isAlreadyRegistered.id);
		}

		await this.registrations.createRegistration(assignmentId, groupId, selectedParticipant.userId, selectedParticipant.id);
		this.events.publish(new UserRegistered(course.id, assignmentId, selectedParticipant.userId, groupId));
	}

	/**
	 * Returns all groups and their members that are registered for this assignment.
	 */
	async getRegisteredGroupsWithMembers(assignmentId: AssignmentId, filter?: AssignmentRegistrationFilter): Promise<[GroupDto[], number]> {
		return await this.registrations.getRegisteredGroupsWithMembers(assignmentId, filter);
	}

	/**
	 * Returns a group and its members for the specified assignment.
	 */
	async getRegisteredGroupWithMembers(assignmentId: AssignmentId, groupId: GroupId): Promise<GroupDto> {
		return this.registrations.getRegisteredGroupWithMembers(assignmentId, groupId);
	}

	/**
	 * Returns the registered group of a participant for an assignment.
	 */
	async getRegisteredGroupOfUser(assignmentId: AssignmentId, userId: UserId): Promise<GroupDto> {
		return this.registrations.getRegisteredGroupOfUser(assignmentId, userId);
	}

	/**
	 * Returns `true`, if any there are any registrations for this assignment.
	 */
	async hasRegistrations(assignmentId: AssignmentId): Promise<boolean> {
		return this.registrations.hasRegistrations(assignmentId);
	}

	/**
	 * Removes the registration of a user for this assignment.
	 */
	async unregisterUser(courseId: CourseId, assignmentId: AssignmentId, userId: UserId): Promise<void> {
		const removed = await this.registrations.removeRegistrationForUser(assignmentId, userId);
		if (removed) {
			this.events.publish(new UserUnregistered(courseId, assignmentId, userId));
		}
	}

	/**
	 * Removes the registration of a group and its members for this assignment.
	 */
	async unregisterGroup(courseId: CourseId, assignmentId: AssignmentId, groupId: GroupId): Promise<void> {
		const removed = await this.registrations.removeRegistrationForGroup(assignmentId, groupId);
		if (removed) {
			this.events.publish(new GroupUnregistered(courseId, assignmentId, groupId));
		}
	}

	/**
	 * Removes all registrations for the specified assignment.
	 */
	async removeAllRegistrations(assignmentId: AssignmentId): Promise<void> {
		await this.registrations.removeRegistrations(assignmentId);
	}

}
