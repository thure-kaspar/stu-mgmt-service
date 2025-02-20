import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { UserId } from "../../shared/entities/user.entity";
import { AssignmentRegistrationFilter } from "../dto/assignment/assignment-registration.filter";
import { GroupDto } from "../dto/group/group.dto";
import { AssignmentId } from "../entities/assignment.entity";
import { CourseId } from "../entities/course.entity";
import { GroupId } from "../entities/group.entity";
import { Participant as ParticipantEntity } from "../entities/participant.entity";
import { GroupRegistered } from "../events/assignment/group-registered.event";
import { GroupUnregistered } from "../events/assignment/group-unregistered.event";
import { RegistrationsCreated } from "../events/assignment/registrations-created.event";
import { RegistrationsRemoved } from "../events/assignment/registrations-removed.event";
import { UserRegistered } from "../events/assignment/user-registered.event";
import { UserUnregistered } from "../events/assignment/user-unregistered.event";
import { AlreadyInGroupException } from "../exceptions/custom-exceptions";
import { Course } from "../models/course.model";
import { Participant } from "../models/participant.model";
import { AssignmentRegistrationRepository } from "../repositories/assignment-registration.repository";
import { GroupSettingsRepository } from "../repositories/group-settings.repository";
import { GroupRepository } from "../repositories/group.repository";
import { ParticipantRepository } from "../repositories/participant.repository";
import { GroupMergeStrategy } from "./group-merge-strategy/group-merge.strategy";

@Injectable()
export class AssignmentRegistrationService {
	constructor(
		private readonly registrations: AssignmentRegistrationRepository,
		private readonly groups: GroupRepository,
		private readonly groupSettings: GroupSettingsRepository,
		private readonly participantsRepository: ParticipantRepository,
		private groupMergeStrategy: GroupMergeStrategy,
		private events: EventBus
	) {}

	/**
	 * Registers the current groups of a course and their members for this assignment.
	 * If the course uses `mergeGroupsOnAssignmentStarted`, groups will be merged according
	 * to the `GroupMergeStrategy`.
	 */
	async registerGroupsForAssignment(course: Course, assignmentId: AssignmentId): Promise<void> {
		const [[groupEntities], groupSettings] = await Promise.all([
			this.groups.getGroupsOfCourse(course.id),
			this.groupSettings.getByCourseId(course.id)
		]);

		let groups: Parameters<AssignmentRegistrationRepository["createRegistrations"]>[1] =
			groupEntities.map(g => ({
				id: g.id,
				members: g.userGroupRelations.map(({ participantId, userId }) => ({
					participantId,
					userId
				}))
			}));

		if (groupSettings.mergeGroupsOnAssignmentStarted) {
			const [mergedGroups, [participants]] = await Promise.all([
				this.groupMergeStrategy.merge(
					course.id,
					groupSettings.sizeMin,
					groupSettings.sizeMax,
					groups
				),
				this.participantsRepository.getParticipants(course.id)
			]);

			const participantsMap = new Map<string, ParticipantEntity>();
			for (const participant of participants) {
				participantsMap.set(participant.userId, participant);
			}

			groups = mergedGroups.map(g => ({
				id: g.id,
				members: g.members.map(m => ({
					userId: m.userId,
					participantId: participantsMap.get(m.userId).id
				}))
			}));
		}

		await this.registrations.createRegistrations(assignmentId, groups);
		this.events.publish(new RegistrationsCreated(course.id, assignmentId));
	}

	/**
	 * Registers a group and its current members for the specified assignment.
	 */
	async registerGroup(
		course: Course,
		assignmentId: AssignmentId,
		groupId: GroupId
	): Promise<void> {
		const group = await this.groups.getGroupWithUsers(groupId);
		const members = group.userGroupRelations.map(relation => relation.participant);
		await this.registrations.createGroupRegistration(assignmentId, groupId, members);
		this.events.publish(new GroupRegistered(course.id, assignmentId, groupId));
	}

	/**
	 * Registers an individual participant for the assignment as member of the specified group.
	 */
	async registerUserToGroup(
		course: Course,
		assignmentId: AssignmentId,
		groupId: GroupId,
		selectedParticipant: Participant
	): Promise<void> {
		const isAlreadyRegistered = await this.registrations.tryGetRegisteredGroupOfUser(
			assignmentId,
			selectedParticipant.userId
		);

		if (isAlreadyRegistered) {
			throw new AlreadyInGroupException(selectedParticipant.userId, isAlreadyRegistered.id);
		}

		await this.registrations.createRegistration(assignmentId, groupId, selectedParticipant.id);

		this.events.publish(
			new UserRegistered(course.id, assignmentId, selectedParticipant.userId, groupId)
		);
	}

	/**
	 * Returns all groups and their members that are registered for this assignment.
	 */
	async getRegisteredGroupsWithMembers(
		assignmentId: AssignmentId,
		filter?: AssignmentRegistrationFilter
	): Promise<[GroupDto[], number]> {
		return await this.registrations.getRegisteredGroupsWithMembers(assignmentId, filter);
	}

	/**
	 * Returns a group and its members for the specified assignment.
	 */
	async getRegisteredGroupWithMembers(
		assignmentId: AssignmentId,
		groupId: GroupId
	): Promise<GroupDto> {
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
	async unregisterUser(
		courseId: CourseId,
		assignmentId: AssignmentId,
		userId: UserId
	): Promise<void> {
		const removed = await this.registrations.removeRegistrationForUser(assignmentId, userId);
		if (removed) {
			this.events.publish(new UserUnregistered(courseId, assignmentId, userId));
		}
	}

	/**
	 * Removes the registration of a group and its members for this assignment.
	 */
	async unregisterGroup(
		courseId: CourseId,
		assignmentId: AssignmentId,
		groupId: GroupId
	): Promise<void> {
		const removed = await this.registrations.removeRegistrationForGroup(assignmentId, groupId);
		if (removed) {
			this.events.publish(new GroupUnregistered(courseId, assignmentId, groupId));
		}
	}

	/**
	 * Removes all registrations for the specified assignment.
	 */
	async removeAllRegistrations(courseId: CourseId, assignmentId: AssignmentId): Promise<void> {
		await this.registrations.removeRegistrations(assignmentId);
		this.events.publish(new RegistrationsRemoved(courseId, assignmentId));
	}
}
