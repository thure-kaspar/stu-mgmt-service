import { BadRequestException, Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { AssessmentDto } from "../../assessment/dto/assessment.dto";
import { AssessmentRepository } from "../../assessment/repositories/assessment.repository";
import { DtoFactory } from "../../shared/dto-factory";
import { UserId } from "../../shared/entities/user.entity";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { GroupCreateBulkDto } from "../dto/group/group-create-bulk.dto";
import { GroupEventDto } from "../dto/group/group-event.dto";
import { GroupFilter } from "../dto/group/group-filter.dto";
import { GroupDto, GroupUpdateDto } from "../dto/group/group.dto";
import { CourseId } from "../entities/course.entity";
import { GroupSettings } from "../entities/group-settings.entity";
import { GroupId } from "../entities/group.entity";
import { UserJoinedGroupEvent } from "../events/group/user-joined-group.event";
import { UserLeftGroupEvent } from "../events/group/user-left-group.event";
import { CourseWithGroupSettings } from "../models/course-with-group-settings.model";
import { Course } from "../models/course.model";
import { Group } from "../models/group.model";
import { Participant } from "../models/participant.model";
import { GroupEventRepository } from "../repositories/group-event.repository";
import { GroupSettingsRepository } from "../repositories/group-settings.repository";
import { GroupRepository } from "../repositories/group.repository";
import { AssignmentRegistrationService } from "./assignment-registration.service";

@Injectable()
export class GroupService {
	constructor(
		private readonly groupRepository: GroupRepository,
		private readonly groupSettingsRepository: GroupSettingsRepository,
		private readonly groupEventRepository: GroupEventRepository,
		private readonly assessmentRepository: AssessmentRepository,
		private registrations: AssignmentRegistrationService,
		private events: EventBus
	) {}

	/**
	 * Creates a new group in the specified course.
	 * Students will automatically join the group.
	 */
	async createGroup(
		course: Course,
		participant: Participant,
		groupDto: GroupDto
	): Promise<GroupDto> {
		const groupSettings = await this.getGroupSettingsOfCourse(course.id);

		course.with(CourseWithGroupSettings, groupSettings).isNotClosed().allowsGroupCreation();

		if (participant.isStudent()) {
			participant.hasNoGroup();
		}

		if (participant.isStudent()) {
			// Create group according to group settings and automatically add student
			return this.createGroupAsStudent(course, groupDto, participant.userId, groupSettings);
		} else {
			// Create group without checking constraints and adding user
			return this.createGroup_Force(course, groupDto);
		}
	}

	/**
	 * Creates a group without checking any constraints.
	 */
	async createGroup_Force(course: Course, groupDto: GroupDto): Promise<GroupDto> {
		const createdGroup = await this.groupRepository.createGroup(course.id, groupDto);
		return DtoFactory.createGroupDto(createdGroup);
	}

	/**
	 * Creates a new group and adds the user to this group.
	 * Supposed to be called when a student creates the group.
	 * If the course enforces a defined prefix for group names, the group name will be set automatically.
	 * @param courseId
	 * @param groupDto
	 * @param userId
	 * @returns The created group.
	 */
	private async createGroupAsStudent(
		course: Course,
		groupDto: GroupDto,
		userId: UserId,
		groupSettings: GroupSettings
	): Promise<GroupDto> {
		groupDto.name = await this.determineName(course, groupSettings, groupDto);

		if (groupSettings.sizeMin > 1) {
			groupDto.isClosed = false;
		}

		const group = await this.groupRepository.createGroup(course.id, groupDto);
		await this.addUserToGroup_Force(course.id, group.id, userId);
		return DtoFactory.createGroupDto(group);
	}

	/**
	 * Returns a group name.
	 * If course uses a name schema the name will use the schema, otherwise it will return the specified name from the dto.
	 * @throws `Error` if name is empty or undefined.
	 */
	async determineName(
		course: Course,
		groupSettings: GroupSettings,
		groupDto: GroupDto
	): Promise<string> {
		let name: string;

		if (groupSettings.nameSchema) {
			name = await this.groupRepository.getAvailableGroupNameForSchema(
				course.id,
				groupSettings.nameSchema
			);
		} else {
			name = groupDto.name;
		}

		if (!name || name === "") {
			throw new Error("Name was empty");
		}

		return name;
	}

	/**
	 * Creates multiple groups at once, using the given names or naming schema and count.
	 */
	async createMultipleGroups(
		courseId: CourseId,
		groupCreateBulk: GroupCreateBulkDto
	): Promise<GroupDto[]> {
		const { names, nameSchema, count } = groupCreateBulk;
		let groups: GroupDto[] = [];

		if (names?.length > 0) {
			groups = this.createGroupsFromNameList(courseId, names);
		} else if (nameSchema?.length > 0 && count) {
			groups = this.createGroupsWithSchemaAndCount(courseId, nameSchema, count);
		} else {
			throw new BadRequestException("GroupCreateBulkDto was invalid.");
		}

		const createdGroups = await this.groupRepository.createMultipleGroups(courseId, groups);
		return createdGroups.map(g => DtoFactory.createGroupDto(g));
	}

	private createGroupsWithSchemaAndCount(
		courseId: string,
		nameSchema: string,
		count: number
	): GroupDto[] {
		const groups: GroupDto[] = [];
		for (let i = 1; i <= count; i++) {
			groups.push({ isClosed: false, name: nameSchema + i, id: null });
		}
		return groups;
	}

	/**
	 * Creates `GroupDtos` from given name list.
	 * @throws `BadRequestException` if name list contains duplicates.
	 */
	private createGroupsFromNameList(courseId: CourseId, names: string[]): GroupDto[] {
		// Check for duplicates
		if (new Set(names).size !== names.length) {
			throw new BadRequestException("Duplicated group names are not allowed.");
		}

		// Create groups using given names
		return names.map(name => ({ courseId, isClosed: false, name, id: null }));
	}

	/**
	 * Adds the user to the group, if the following conditions are fulfilled:
	 *   - Group is not closed
	 *   - Group has not reached the allowed maximum capacity
	 *   - Given password matches the group's password
	 */
	async addUserToGroup(
		course: Course,
		group: Group,
		participant: Participant,
		selectedParticipant: Participant,
		password?: string
	): Promise<void> {
		selectedParticipant.hasNoGroup();

		const groupSettings = await this.getGroupSettingsOfCourse(course.id);
		course.with(CourseWithGroupSettings, groupSettings).isNotClosed();

		if (participant.isStudent()) {
			group.isNotClosed().hasCapacity(groupSettings.sizeMax).acceptsPassword(password);
		}

		const added = await this.groupRepository.addUserToGroup(
			course.id,
			group.id,
			selectedParticipant.userId
		);
		if (added) {
			this.events.publish(
				new UserJoinedGroupEvent(course.id, group.id, selectedParticipant.userId)
			);
		} else {
			throw new BadRequestException(
				`Failed to add user (${selectedParticipant.userId}) to group (${group.id})`
			);
		}
	}

	/**
	 * Adds the user to the group without checking any constraints.
	 */
	async addUserToGroup_Force(
		courseId: CourseId,
		groupId: GroupId,
		userId: UserId
	): Promise<void> {
		const added = await this.groupRepository.addUserToGroup(courseId, groupId, userId);
		if (added) {
			this.events.publish(new UserJoinedGroupEvent(courseId, groupId, userId));
		} else {
			throw new BadRequestException("Failed to add user to group.");
		}
	}

	/**
	 * Returns all groups of a course and their members.
	 */
	async getGroupsOfCourse(
		courseId: CourseId,
		filter?: GroupFilter
	): Promise<[GroupDto[], number]> {
		const [groups, count] = await this.groupRepository.getGroupsOfCourse(courseId, filter);
		const dtos = groups.map(group => DtoFactory.createGroupDto(group));
		return [dtos, count];
	}

	/**
	 * Returns the group with its members.
	 */
	async getGroup(groupId: GroupId): Promise<GroupDto> {
		const group = await this.groupRepository.getGroupById_All(groupId);
		return DtoFactory.createGroupDto(group, { includePassword: true });
	}

	async getUsersOfGroup(groupId: GroupId): Promise<ParticipantDto[]> {
		const group = await this.groupRepository.getGroupWithUsers(groupId);
		const participants = group.userGroupRelations.map(x => x.participant.toDto());
		return participants;
	}

	async getAssessmentsOfGroup(groupId: GroupId): Promise<AssessmentDto[]> {
		const assessments = await this.assessmentRepository.getAssessmentsOfGroup(groupId);
		return assessments.map(a => DtoFactory.createAssessmentDto(a));
	}

	/** Returns all group events of the course. */
	async getGroupHistoryOfCourse(courseId: CourseId): Promise<GroupEventDto[]> {
		const events = await this.groupEventRepository.getGroupHistoryOfCourse(courseId);
		return events.map(event => event.toDto());
	}

	/**
	 * Returns the group and its members for an assignment.
	 */
	async getGroupFromAssignment(groupId: GroupId, assignmentId: string): Promise<GroupDto> {
		return this.registrations.getRegisteredGroupWithMembers(assignmentId, groupId);
	}

	/**
	 * Returns all groups and their members that are registered for this assignment.
	 */
	async getGroupsFromAssignment(
		courseId: CourseId,
		assignmentId: string
	): Promise<[GroupDto[], number]> {
		return this.registrations.getRegisteredGroupsWithMembers(assignmentId);
	}

	/**
	 * Updates the group partially with values from the given `GroupUpdateDto`.
	 * Returns the updated groups without relations.
	 * @throws Exception, if any constraint is violated.
	 */
	async updateGroup(course: Course, group: Group, update: GroupUpdateDto): Promise<GroupDto> {
		const groupSettings = await this.getGroupSettingsOfCourse(course.id);

		const _course = course.with(CourseWithGroupSettings, groupSettings).isNotClosed();

		if (group.wantsToChangeName(update)) {
			_course.allowsSelfManagedGroups().allowsGroupToRename();
		}

		if (group.wantsToClose(update)) {
			_course.allowsGroupToClose(group);
		}

		const updated = await this.groupRepository.updateGroup(group.id, update);
		return DtoFactory.createGroupDto(updated);
	}

	/**
	 * Removes the `selectedParticipant` from the given `group`.
	 * If the requesting `participant` is a `STUDENT`, he must be ...
	 * - member of the group
	 * - allowed to remove group members
	 */
	async removeUser(
		course: Course,
		group: Group,
		participant: Participant,
		selectedParticipant: Participant,
		reason?: string
	): Promise<void> {
		course.isNotClosed();

		if (participant.isStudent()) {
			participant.isMemberOfGroup(group).isAllowedToRemoveGroupMember(selectedParticipant);

			const groupSettings = await this.getGroupSettingsOfCourse(course.id);
			course.with(CourseWithGroupSettings, groupSettings).allowsSelfManagedGroups();
		}

		const removed = await this.groupRepository.removeUser(group.id, selectedParticipant.userId);
		if (removed) {
			await this.events.publish(
				new UserLeftGroupEvent(course.id, group.id, selectedParticipant.userId, reason)
			);
		} else {
			throw new BadRequestException(
				`Failed to remove user (${selectedParticipant.userId}) from group (${group.id}).`
			);
		}
	}

	async deleteGroup(course: Course, group: Group, participant: Participant): Promise<boolean> {
		course.isNotClosed();

		if (participant.isStudent()) {
			participant.isAllowedToRemoveTheirGroup();

			const groupSettings = await this.getGroupSettingsOfCourse(course.id);
			course.with(CourseWithGroupSettings, groupSettings).allowsSelfManagedGroups();
		}

		return this.groupRepository.deleteGroup(group.id);
	}

	private getGroupSettingsOfCourse(courseId: CourseId): Promise<GroupSettings> {
		return this.groupSettingsRepository.getByCourseId(courseId);
	}
}
