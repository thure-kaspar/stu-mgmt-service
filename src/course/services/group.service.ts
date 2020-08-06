import { BadRequestException, Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { DtoFactory } from "../../shared/dto-factory";
import { User } from "../../shared/entities/user.entity";
import { isStudent } from "../../shared/enums";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { GroupCreateBulkDto } from "../dto/group/group-create-bulk.dto";
import { GroupEventDto } from "../dto/group/group-event.dto";
import { GroupFilter } from "../dto/group/group-filter.dto";
import { GroupDto, GroupUpdateDto } from "../dto/group/group.dto";
import { Assignment } from "../entities/assignment.entity";
import { Course as CourseEntity, CourseId } from "../entities/course.entity";
import { GroupEvent, replayEvents } from "../entities/group-event.entity";
import { GroupSettings } from "../entities/group-settings.entity";
import { Group } from "../entities/group.entity";
import { UserJoinedGroupEvent } from "../events/user-joined-group.event";
import { UserLeftGroupEvent } from "../events/user-left-group.event";
import { Course } from "../models/course.model";
import { GroupModel } from "../models/group.model";
import { Participant } from "../models/participant.model";
import { AssignmentRepository } from "../repositories/assignment.repository";
import { CourseRepository } from "../repositories/course.repository";
import { GroupEventRepository } from "../repositories/group-event.repository";
import { GroupRepository } from "../repositories/group.repository";

@Injectable()
export class GroupService {

	constructor(@InjectRepository(Group) private groupRepository: GroupRepository,
				@InjectRepository(CourseEntity) private courseRepository: CourseRepository,
				@InjectRepository(GroupEvent) private groupEventRepository: GroupEventRepository,
				@InjectRepository(Assignment) private assignmentRepository: AssignmentRepository, 
				private events: EventBus) { }

	/**
	 * Creates a new group in the specified course.  
	 * Students will automatically join the group.
	 */
	async createGroup(course: Course, participant: Participant, groupDto: GroupDto): Promise<GroupDto> {
		const courseEntity = await this.courseRepository.getCourseWithConfigAndGroupSettings(course.id);
		const groupSettings = courseEntity.config.groupSettings;
		
		course.isNotClosed().and().allowsGroupCreation();
		
		if (participant.isStudent()) {
			participant.hasNoGroup();
		}

		let group: GroupDto;
		
		// Determine, if requesting user is student
		if (isStudent(participant)) {
			// Create group according to group settings and automatically add student
			group = await this.createGroupAsStudent(course, groupDto, participant.userId, groupSettings);
		} else {
			// Create group without checking constraints and adding user
			group = await this.createGroup_Force(course, groupDto);
		}
		
		return group;
	}

	/**
	 * Creates a group without checking any constraints.
	 */
	private async createGroup_Force(course: Course, groupDto: GroupDto): Promise<GroupDto> {
		const createdGroup = await this.groupRepository.createGroup(groupDto);
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
	private async createGroupAsStudent(course: Course, groupDto: GroupDto, userId: string, groupSettings: GroupSettings): Promise<GroupDto> {
		groupDto.name = await this.determineName(course, groupSettings, groupDto);

		if (groupSettings.sizeMin > 1) {
			groupDto.isClosed = false;
		}

		const group = await this.groupRepository.createGroup(groupDto);
		await this.addUserToGroup_Force(course.id, group.id, userId);
		return DtoFactory.createGroupDto(group);
	}

	/**
	 * Returns a group name.
	 * If course uses a name schema the name will use the schema, otherwise it will return the specified name from the dto.
	 * @throws `Error` if name is empty or undefined.
	 */
	private async determineName(course: Course, groupSettings: GroupSettings, groupDto: GroupDto): Promise<string> {
		let name: string;

		if (groupSettings.nameSchema) {
			name = await this.groupRepository.getAvailableGroupNameForSchema(course.id, groupSettings.nameSchema);
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
	async createMultipleGroups(courseId: CourseId, groupCreateBulk: GroupCreateBulkDto): Promise<GroupDto[]> {
		const { names, nameSchema, count } = groupCreateBulk;
		let groups: GroupDto[] = [];

		if (names?.length > 0) {
			groups = this.createGroupsFromNameList(courseId, names);
		} else if (nameSchema?.length > 0 && count) {
			groups = this.createGroupsWithSchemaAndCount(courseId, nameSchema, count);
		} else {
			throw new BadRequestException("GroupCreateBulkDto was invalid.");
		}

		const createdGroups = await this.groupRepository.createMultipleGroups(groups);
		return createdGroups.map(g => DtoFactory.createGroupDto(g));
	}

	private createGroupsWithSchemaAndCount(courseId: string, nameSchema: string, count: number): GroupDto[] {
		const groups: GroupDto[] = [];
		for (let i = 1; i <= count; i++) {
			groups.push({ isClosed: false, name: nameSchema + i });
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
		return names.map(name => ({ courseId, isClosed: false, name }));
	}
	
	/**
	 * Adds the user to the group, if the following conditions are fulfilled:
	 *   - Group is not closed
	 *   - Group has not reached the allowed maximum capacity
	 *   - Given password matches the group's password
	 */
	async addUserToGroup(courseId: CourseId, groupId: string, userId: string, password?: string): Promise<void> {
		const group = await this.groupRepository.getGroupForAddUserToGroup(groupId, userId);
		const sizeMax = group.course.config.groupSettings.sizeMax;
		
		new GroupModel(group)
			.isNotClosed()
			.hasCapacity(sizeMax)
			.acceptsPassword(password);

		const added = await this.groupRepository.addUserToGroup(courseId, groupId, userId);
		if (added) {
			this.events.publish(new UserJoinedGroupEvent(groupId, userId));
		} else {
			throw new BadRequestException("Failed to add user to group.");
		}
	}

	/**
	 * Adds the user to the group without checking any constraints. 
	 */
	async addUserToGroup_Force(courseId: CourseId, groupId: string, userId: string): Promise<void> {
		const added = await this.groupRepository.addUserToGroup(courseId, groupId, userId);
		if (added) {
			this.events.publish(new UserJoinedGroupEvent(groupId, userId));
		} else {
			throw new BadRequestException("Failed to add user to group.");
		}
	}

	async getGroupsOfCourse(courseId: CourseId, filter?: GroupFilter): Promise<[GroupDto[], number]> {
		const [groups, count] = await this.groupRepository.getGroupsOfCourse(courseId, filter);
		const dtos = groups.map(group => DtoFactory.createGroupDto(group));
		return [dtos, count];
	}

	/**
	 * Returns the group with its users, assessments and history.
	 */
	async getGroup(groupId: string): Promise<GroupDto> {
		const group = await this.groupRepository.getGroupById_All(groupId);
		return DtoFactory.createGroupDto(group);
	}

	async getUsersOfGroup(groupId: string): Promise<ParticipantDto[]> {
		const group = await this.groupRepository.getGroupWithUsers(groupId);
		const participants = group.userGroupRelations.map(x => x.participant.toDto());
		return participants;
	}

	/** Returns all group events of the course. */
	async getGroupHistoryOfCourse(courseId: CourseId): Promise<GroupEventDto[]> {
		const events = await this.groupEventRepository.getGroupHistoryOfCourse(courseId);
		return events.map(event => event.toDto());
	}

	/**
	 * Returns the group and its members for an assignment.
	 * If assignment has no end date, returns the group with current members.
	 */
	async getGroupFromAssignment(groupId: string, assignmentId: string): Promise<GroupDto> {
		const assignment = await this.assignmentRepository.getAssignmentById(assignmentId);
		
		// If assignment has no end date, return the group with its current members
		if (!assignment.endDate) {
			return this.getGroup(groupId); 
		}

		// Get all events that happened before the assignment end
		const history = await this.groupEventRepository.getGroupHistoryOfGroup(groupId, assignment.endDate);
		
		// Replay group event and recreate group
		const userIdUserMap = new Map<string, User>();

		replayEvents(history, (groupEvent) => {
			const { event, user } = groupEvent;
			switch (event) {
			case UserJoinedGroupEvent.name:
				userIdUserMap.set(user.id, user);
				break;
			case UserLeftGroupEvent.name:
				userIdUserMap.delete(user.id);
				break;
			default:
				break;
			}
		});

		// Load recreated group with users
		const groups = await this.groupRepository.getRecreatedGroups(
			new Map([[groupId, Array.from(userIdUserMap.values())]])
		);
		return DtoFactory.createGroupDto(groups[0]);
	}

	/**
	 * Returns a snapshot of the group constellations at the time of the assignment's end.
	 */
	async getGroupsFromAssignment(courseId: CourseId, assignmentId: string): Promise<GroupDto[]> {
		const assignment = await this.assignmentRepository.getAssignmentById(assignmentId);

		// If assignment has no end date, return current groups with their members
		if (!assignment.endDate) {
			return (await this.getGroupsOfCourse(courseId)[0]);
		}

		// Get all events that happened before the assignment end
		const history = await this.groupEventRepository.getGroupHistoryOfCourse(courseId, assignment.endDate);

		// Replay the events to recreate the group constellations
		const groupIdUsersMap = new Map<string, User[]>();

		replayEvents(history, (groupEvent) => {
			const { event, user, groupId } = groupEvent;
			switch (event) {
			case UserJoinedGroupEvent.name:
				// Add user to group
				if (groupIdUsersMap.has(groupId)) {
					groupIdUsersMap.get(groupId).push(user);
				} else {
					groupIdUsersMap.set(groupId, [user]);
				}
				break;
			case UserLeftGroupEvent.name:
				// Remove user from group
				const groupWithoutUser = groupIdUsersMap.get(groupId).filter(u => u.id !== user.id);
				groupIdUsersMap.set(groupId, groupWithoutUser);
				break;
			default:
				break;
			}
		});

		// Generate groups from the group constellation map
		const groups = await this.groupRepository.getRecreatedGroups(groupIdUsersMap);
		return groups.map(g => DtoFactory.createGroupDto(g));
	}

	/**
	 * Updates the group partially with values from the given `GroupUpdateDto`.
	 * Returns the updated groups without relations.
	 * @throws Exception, if any constraint is violated.
	 */
	async updateGroup(courseId: CourseId, groupId: string, update: GroupUpdateDto): Promise<GroupDto> {
		const { name, password, isClosed } = update;
		const [courseEntity, group] = await Promise.all([
			this.courseRepository.getCourseWithConfigAndGroupSettings(courseId),
			this.groupRepository.getGroupWithUsers(groupId)
		]);

		const course = new Course(courseEntity)
			.isNotClosed();
		
		if (name && (name !== group.name)) {
			course
				.allowsSelfManagedGroups()
				.allowsGroupToRename();
		}

		if (isClosed === true && !group.isClosed) {
			course.allowsGroupToClose(group);
		}

		const updated = await this.groupRepository.updateGroup(groupId, update);
		return DtoFactory.createGroupDto(updated);
	}

	async removeUser(groupId: string, userId: string, reason?: string): Promise<void> {
		const removed = await this.groupRepository.removeUser(groupId, userId);
		if (removed) {
			this.events.publish(new UserLeftGroupEvent(groupId, userId, reason));
		} else {
			throw new BadRequestException("Failed to remove the user.");
		}
	}

	async deleteGroup(groupId: string): Promise<boolean> {
		return this.groupRepository.deleteGroup(groupId);
	}

}
