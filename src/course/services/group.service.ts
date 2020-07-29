import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { DtoFactory } from "../../shared/dto-factory";
import { UserDto } from "../../shared/dto/user.dto";
import { User } from "../../shared/entities/user.entity";
import { isStudent } from "../../shared/enums";
import { GroupCreateBulkDto } from "../dto/group/group-create-bulk.dto";
import { GroupEventDto } from "../dto/group/group-event.dto";
import { GroupFilter } from "../dto/group/group-filter.dto";
import { GroupDto } from "../dto/group/group.dto";
import { Assignment } from "../entities/assignment.entity";
import { Course, CourseId } from "../entities/course.entity";
import { GroupEvent, replayEvents } from "../entities/group-event.entity";
import { GroupSettings } from "../entities/group-settings.entity";
import { Group } from "../entities/group.entity";
import { UserJoinedGroupEvent } from "../events/user-joined-group.event";
import { UserLeftGroupEvent } from "../events/user-left-group.event";
import { CourseClosedException, GroupsForbiddenException } from "../exceptions/custom-exceptions";
import { AssignmentRepository } from "../repositories/assignment.repository";
import { CourseRepository } from "../repositories/course.repository";
import { GroupEventRepository } from "../repositories/group-event.repository";
import { GroupRepository } from "../repositories/group.repository";
import { CourseParticipantsService } from "./course-participants.service";

@Injectable()
export class GroupService {

	constructor(@InjectRepository(Group) private groupRepository: GroupRepository,
				@InjectRepository(Course) private courseRepository: CourseRepository,
				@InjectRepository(GroupEvent) private groupEventRepository: GroupEventRepository,
				@InjectRepository(Assignment) private assignmentRepository: AssignmentRepository, 
				private courseParticipants: CourseParticipantsService,
				private events: EventBus) { }

	/**
	 * Creates a group, if the course allows group creation.
	 * @param courseId - The course, where the group should be created
	 * @param groupDto - The group that should be created
	 * @param userId - 
	 */
	async createGroup(courseId: CourseId, groupDto: GroupDto, participant: UserDto): Promise<GroupDto> {
		const course = await this.courseRepository.getCourseWithConfigAndGroupSettings(courseId);
		const groupSettings = course.config.groupSettings;
		
		// Only proceed, if group creation is allowed
		this.failIfGroupCreationIsNotAllowed(course, groupSettings);

		let group: GroupDto;
		groupDto.courseId = courseId;
		
		// Determine, if requesting user is student
		if (isStudent(participant)) {
			// Create group according to group settings and automatically add student
			group = await this.createGroupAsStudent(courseId, groupDto, participant.id, groupSettings);
		} else {
			// Create group without checking constraints and adding user
			group = await this.createGroup_Force(groupDto);
		}
		
		return group;
	}

	/**
	 * Throws an appropriate domain exception, if group creation is not allowed. 
	 */
	private failIfGroupCreationIsNotAllowed(course: Course, groupSettings: GroupSettings): void {
		if (course.isClosed) {
			throw new CourseClosedException(course.id);
		}
		if (!groupSettings.allowGroups) {
			throw new GroupsForbiddenException(course.id);
		}
	}

	/**
	 * Creates a group without checking any constraints.
	 */
	private async createGroup_Force(groupDto: GroupDto): Promise<GroupDto> {
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
	private async createGroupAsStudent(courseId: CourseId, groupDto: GroupDto, userId: string, groupSettings: GroupSettings): Promise<GroupDto> {
		groupDto.name = await this.determineName(courseId, groupSettings, groupDto);
		const group = await this.groupRepository.createGroup(groupDto);
		await this.addUserToGroup_Force(group.id, userId);
		return DtoFactory.createGroupDto(group);
	}

	/**
	 * Returns a group name.
	 * If course uses a name schema the name will use the schema, otherwise it will return the specified name from the dto.
	 * @throws `Error` if name is empty or undefined.
	 */
	private async determineName(courseId: CourseId, groupSettings: GroupSettings, groupDto: GroupDto): Promise<string> {
		let name: string;

		if (groupSettings.nameSchema) {
			name = await this.groupRepository.getAvailableGroupNameForSchema(courseId, groupSettings.nameSchema);
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
			// Create groups using given names
			groups = names.map(name => ({ courseId, isClosed: false, name }));
		} else if (nameSchema && count) {
			// Create group with schema and count
			for (let i = 1; i <= count; i++) {
				groups.push({ courseId, isClosed: false, name: nameSchema + i });
			}
		} else {
			throw new BadRequestException("GroupCreateBulkDto was invalid.");
		}

		const createdGroups = await this.groupRepository.createMultipleGroups(groups);
		return createdGroups.map(g => DtoFactory.createGroupDto(g));
	}
	
	/**
	 * Adds the user to the group, if the following conditions are fulfilled:
	 *   - Group is not closed
	 *   - Group has not reached the allowed maximum capacity
	 *   - Given password matches the group's password
	 */
	async addUserToGroup(groupId: string, userId: string, password?: string): Promise<void> {
		const group = await this.groupRepository.getGroupForAddUserToGroup(groupId, userId);
		const sizeMax = group.course.config.groupSettings.sizeMax;
		const sizeCurrent  = group.userGroupRelations.length;
		
		if (group.isClosed) throw new ConflictException("Group is closed.");
		if (sizeCurrent >= sizeMax) throw new ConflictException("Group is full.");
		if (group.password && group.password !== password) throw new BadRequestException("The given password was incorrect.");

		const added = await this.groupRepository.addUserToGroup(groupId, userId);
		if (added) {
			this.events.publish(new UserJoinedGroupEvent(groupId, userId));
		} else {
			throw new BadRequestException("Failed to add user to group.");
		}
	}

	/**
	 * Adds the user to the group without checking any constraints. 
	 */
	async addUserToGroup_Force(groupId: string, userId: string): Promise<void> {
		const added = await this.groupRepository.addUserToGroup(groupId, userId);
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

	async getUsersOfGroup(groupId: string): Promise<UserDto[]> {
		const group = await this.groupRepository.getGroupWithUsers(groupId);
		const userDtos = group.userGroupRelations.map(userGroupRelation => DtoFactory.createUserDto(userGroupRelation.user));
		return userDtos;
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

	async updateGroup(groupId: string, groupDto: GroupDto): Promise<GroupDto> {
		if (groupId !== groupDto.id) {
			throw new BadRequestException("GroupId refers to a different group.");
		}
		const group = await this.groupRepository.updateGroup(groupId, groupDto);
		return DtoFactory.createGroupDto(group);
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
