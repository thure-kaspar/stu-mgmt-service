import { Injectable, BadRequestException, ConflictException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GroupRepository } from "../database/repositories/group.repository";
import { CourseRepository } from "../database/repositories/course.repository";
import { Course } from "../../shared/entities/course.entity";
import { Group } from "../../shared/entities/group.entity";
import { GroupDto } from "../../shared/dto/group.dto";
import { UserDto } from "../../shared/dto/user.dto";
import * as fromDtoFactory from "../../shared/dto-factory";

@Injectable()
export class GroupService {

	constructor(@InjectRepository(Group) private groupRepository: GroupRepository,
				@InjectRepository(Course) private courseRepository: CourseRepository) { }

	async createGroup(courseId: string, groupDto: GroupDto): Promise<GroupDto> {
		const createdGroup = await this.groupRepository.createGroup(courseId, groupDto);
		const createdGroupDto = fromDtoFactory.createGroupDto(createdGroup);
		return createdGroupDto;
	}

	/**
	 * Adds the user to the group, if the following conditions are fulfilled:
	 *   - Group is not closed
	 *   - Group has not reached the allowed maximum capacity
	 *   - Given password matches the group's password
	 */
	async addUserToGroup(groupId: string, userId: string, password?: string): Promise<any> {
		const group = await this.groupRepository.getGroupWithUsers(groupId);

		if (group.isClosed) throw new ConflictException("Group is closed.")
		if (group.userGroupRelations.length >= group.course.maxGroupSize) throw new ConflictException("Group is full.");
		if (group.password !== password) throw new UnauthorizedException("The given password was incorrect.");

		return await this.groupRepository.addUserToGroup(groupId, userId);
	}

	/**
	 * Adds the user to the group without checking any constraints. 
	 */
	async addUserToGroup_Force(groupId: string, userId: string, password?: string): Promise<any> {
		return await this.groupRepository.addUserToGroup(groupId, userId);
	}

	async getGroupsOfCourse(courseId: string): Promise<GroupDto[]> {
		const groups = await this.groupRepository.getGroupsOfCourse(courseId);
		return groups;
	}

	async getUsersOfGroup(groupId: string): Promise<UserDto[]> {
		const group = await this.groupRepository.getGroupWithUsers(groupId);
		const userDtos = [];
		group.userGroupRelations.forEach(userGroupRelation => {
			userDtos.push(fromDtoFactory.createUserDto(userGroupRelation.user));
		});
		return userDtos;
	}

	async updateGroup(groupId: string, groupDto: GroupDto): Promise<GroupDto> {
		if (groupId !== groupDto.id) {
			throw new BadRequestException("GroupId refers to a different group.");
		}
		const group = await this.groupRepository.updateGroup(groupId, groupDto);
		return fromDtoFactory.createGroupDto(group);
	}

	async deleteGroup(groupId: string): Promise<boolean> {
		return await this.groupRepository.deleteGroup(groupId);
	}

}
