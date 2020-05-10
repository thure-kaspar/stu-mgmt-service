import { Injectable, BadRequestException, ConflictException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GroupRepository } from "../database/repositories/group.repository";
import { CourseRepository } from "../database/repositories/course.repository";
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

@Injectable()
export class GroupService {

	constructor(@InjectRepository(Group) private groupRepository: GroupRepository,
				@InjectRepository(Course) private courseRepository: CourseRepository,
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
	async addUserToGroup(groupId: string, userId: string, password?: string): Promise<any> {
		const group = await this.groupRepository.getGroupForAddUserToGroup(groupId, userId);
		const sizeMax = group.course.config.groupSettings.sizeMax;
		const sizeCurrent  = group.userGroupRelations.length;
		
		if (group.isClosed) throw new ConflictException("Group is closed.");
		if (sizeCurrent >= sizeMax) throw new ConflictException("Group is full.");
		if (group.password && group.password !== password) throw new BadRequestException("The given password was incorrect.");

		const added = await this.groupRepository.addUserToGroup(groupId, userId);
		if (added) {
			this.events.publish(new UserJoinedGroupEvent(groupId, userId));
		}
		return added;
	}

	/**
	 * Adds the user to the group without checking any constraints. 
	 */
	async addUserToGroup_Force(groupId: string, userId: string): Promise<any> {
		const added = this.groupRepository.addUserToGroup(groupId, userId);
		if (added) {
			this.events.publish(new UserJoinedGroupEvent(groupId, userId));
		}
		return added;
	}

	async getGroupsOfCourse(courseId: string): Promise<GroupDto[]> {
		const groups = await this.groupRepository.getGroupsOfCourse(courseId);
		return groups.map(group => DtoFactory.createGroupDto(group));
	}

	async getUsersOfGroup(groupId: string): Promise<UserDto[]> {
		const group = await this.groupRepository.getGroupWithUsers(groupId);
		const userDtos = group.userGroupRelations.map(userGroupRelation => DtoFactory.createUserDto(userGroupRelation.user));
		return userDtos;
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
			throw new BadRequestException("Removal failed.");
		}
	}

	async deleteGroup(groupId: string): Promise<boolean> {
		return this.groupRepository.deleteGroup(groupId);
	}

}
