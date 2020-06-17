import { Injectable, BadRequestException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GroupRepository } from "../repositories/group.repository";
import { CourseRepository } from "../repositories/course.repository";
import { Course } from "../entities/course.entity";
import { Group } from "../entities/group.entity";
import { GroupDto } from "../dto/group/group.dto";
import { UserDto } from "../../shared/dto/user.dto";
import { DtoFactory } from "../../shared/dto-factory";
import { CourseClosedException, GroupsForbiddenException } from "../exceptions/custom-exceptions";
import { GroupCreateBulkDto } from "../dto/group/group-create-bulk.dto";
import { EventBus } from "@nestjs/cqrs";
import { UserJoinedGroupEvent } from "../events/user-joined-group.event";
import { UserLeftGroupEvent } from "../events/user-left-group.event";
import { GroupEvent, replayEvents } from "../entities/group-event.entity";
import { GroupEventRepository } from "../repositories/group-event.repository";
import { Assignment } from "../entities/assignment.entity";
import { AssignmentRepository } from "../repositories/assignment.repository";
import { User } from "../../shared/entities/user.entity";
import { GroupEventDto } from "../dto/group/group-event.dto";

@Injectable()
export class GroupService {

	constructor(@InjectRepository(Group) private groupRepository: GroupRepository,
				@InjectRepository(Course) private courseRepository: CourseRepository,
				@InjectRepository(GroupEvent) private groupEventRepository: GroupEventRepository,
				@InjectRepository(Assignment) private assignmentRepository: AssignmentRepository, 
				private events: EventBus) { }

	/**
	 * Creates a group, if the course allows groups.
	 */
	async createGroup(courseId: string, groupDto: GroupDto): Promise<GroupDto> {
		if (courseId !== groupDto.courseId) throw new BadRequestException("CourseId refers to a different course");

		// Check if group creation is allowed
		const course = await this.courseRepository.getCourseWithConfigAndGroupSettings(courseId);
		if (course.isClosed) throw new CourseClosedException();
		if (!course.config.groupSettings.allowGroups) throw new GroupsForbiddenException();
		
		const createdGroup = await this.groupRepository.createGroup(groupDto);
		return DtoFactory.createGroupDto(createdGroup);
	}

	/**
	 * Creates multiple groups at once, using the given names or naming schema and count.
	 */
	async createMultipleGroups(courseId: string, groupCreateBulk: GroupCreateBulkDto): Promise<GroupDto[]> {
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
		const added = this.groupRepository.addUserToGroup(groupId, userId);
		if (added) {
			this.events.publish(new UserJoinedGroupEvent(groupId, userId));
		} else {
			throw new BadRequestException("Failed to add user to group.");
		}
	}

	async getGroupsOfCourse(courseId: string): Promise<GroupDto[]> {
		const groups = await this.groupRepository.getGroupsOfCourse(courseId);
		return groups.map(group => DtoFactory.createGroupDto(group));
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
	async getGroupHistoryOfCourse(courseId: string): Promise<GroupEventDto[]> {
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
	async getGroupsFromAssignment(courseId: string, assignmentId: string): Promise<GroupDto[]> {
		const assignment = await this.assignmentRepository.getAssignmentById(assignmentId);

		// If assignment has no end date, return current groups with their members
		if (!assignment.endDate) {
			return this.getGroupsOfCourse(courseId);
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
