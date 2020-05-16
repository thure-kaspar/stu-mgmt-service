import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "../repositories/user.repository";
import { User } from "../../shared/entities/user.entity";
import { UserDto } from "../../shared/dto/user.dto";
import { CourseDto } from "src/course/dto/course/course.dto";
import { GroupDto } from "../../course/dto/group/group.dto";
import { Group } from "../../course/entities/group.entity";
import { GroupRepository } from "../../course/database/repositories/group.repository";
import { Assessment } from "../../course/entities/assessment.entity";
import { AssessmentRepository } from "../../course/database/repositories/assessment.repository";
import { AssessmentDto } from "../../course/dto/assessment/assessment.dto";
import { DtoFactory } from "../../shared/dto-factory";
import { Assignment } from "../../course/entities/assignment.entity";
import { AssignmentRepository } from "../../course/database/repositories/assignment.repository";
import { GroupEvent } from "../../course/entities/group-event.entity";
import { GroupEventDto } from "../../course/dto/group/group-event.dto";
import { GroupEventRepository } from "../../course/database/repositories/group-event.repository";
import { UserLeftGroupEvent } from "../../course/events/user-left-group.event";

@Injectable()
export class UserService {

	constructor(@InjectRepository(User) private userRepository: UserRepository,
				@InjectRepository(Group) private groupRepository: GroupRepository,
				@InjectRepository(Assignment) private assignmentRepository: AssignmentRepository,
				@InjectRepository(Assessment) private assessmentRepository: AssessmentRepository,
				@InjectRepository(GroupEvent) private groupEventRepository: GroupEventRepository) { }

	async createUser(userDto: UserDto): Promise<UserDto> {
		const createdUser = await this.userRepository.createUser(userDto);
		const createdUserDto = DtoFactory.createUserDto(createdUser);
		return createdUserDto;
	}

	async getAllUsers(): Promise<UserDto[]> {
		const users = await this.userRepository.getAllUsers();
		return users.map(user => DtoFactory.createUserDto(user));
	}

	async getUserById(id: string): Promise<UserDto> {
		const user = await this.userRepository.getUserById(id);
		return DtoFactory.createUserDto(user);
	}

	async getUserByEmail(email: string): Promise<UserDto> {
		const user = await this.userRepository.getUserByEmail(email);
		return DtoFactory.createUserDto(user);
	}

	async getCoursesOfUser(userId: string): Promise<CourseDto[]> {
		const courses = await this.userRepository.getCoursesOfUser(userId);
		const courseDtos: CourseDto[] = [];
		courses.forEach(course => courseDtos.push(DtoFactory.createCourseDto(course)));
		return courseDtos;
	}

	/**
	 * Returns a collection of all groups the user is part of in the given course.
	 */
	async getGroupsOfUserForCourse(userId: string, courseId: string): Promise<GroupDto[]> {
		const currentGroups = await this.groupRepository.getCurrentGroupsOfUserForCourse(courseId, userId);
		return currentGroups.map(g => DtoFactory.createGroupDto(g));
	}

	/**
	 * Returns all group events of the user in the course.
	 * Events are sorted by their timestamp in descending order (new to old). 
	 */
	async getGroupHistoryOfUser(userId: string, courseId: string): Promise<GroupEventDto[]> {
		const history = await this.groupEventRepository.getGroupHistoryOfUser(userId, courseId);
		return history.map(event => event.toDto());
	}

	/**
	 * Returns the group that the user was a member of when the assignment submission closed.
	 */
	async getGroupOfAssignment(userId: string, courseId: string, assignmentId: string): Promise<GroupDto> {
		const [groupHistory, assignment] = await Promise.all([
			this.groupEventRepository.getGroupHistoryOfUser(userId, courseId),
			this.assignmentRepository.getAssignmentById(assignmentId)
		]);

		if (!assignment.endDate) { 
			throw new BadRequestException("Failed to determine the user's group, because assignment has no end date.");
		}

		// Find last event that happened before assignment submission closed
		const lastEventBeforeAssignmentEnd = groupHistory.find(event => 
			event.timestamp.getTime() < assignment.endDate.getTime()
		);

		// Return null, if user was not in a group
		if (!lastEventBeforeAssignmentEnd || lastEventBeforeAssignmentEnd.event === UserLeftGroupEvent.name) {
			return null;
		}

		const group = await this.groupRepository.getGroupById(lastEventBeforeAssignmentEnd.groupId);
		return DtoFactory.createGroupDto(group);
	}

	async getAssessmentsOfUserForCourse(userId: string, courseId: string): Promise<AssessmentDto[]> {
		const assessments = await this.assessmentRepository.getAssessmentsOfUserForCourse_WithAssignment_WithGroups(courseId, userId);
		return assessments.map(a => DtoFactory.createAssessmentDto(a));
	}

	async updateUser(userId: string, userDto: UserDto): Promise<UserDto> {
		if (userId !== userDto.id) {
			throw new BadRequestException("UserId refers to a different user.");
		}
		const user = await this.userRepository.updateUser(userId, userDto);
		return DtoFactory.createUserDto(user);
	}
	
	async deleteUser(userId: string): Promise<boolean> {
		return this.userRepository.deleteUser(userId);
	}
    
}
