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
import { UserJoinedGroupEvent } from "../../course/events/user-joined-group.event";

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
	 * Returns the current group of a user in a course.
	 */
	async getGroupOfUserForCourse(userId: string, courseId: string): Promise<GroupDto> {
		const group = await this.groupRepository.getGroupOfUserForCourse(courseId, userId);
		return DtoFactory.createGroupDto(group);
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

		// If user never joined a group
		if (groupHistory.length == 0) return null; 

		let groupId = null;

		// If assignment has not ended yet, assign current group (if it exists)
		if (!assignment.endDate) {
			if (groupHistory[0].event === UserJoinedGroupEvent.name) {
				groupId = groupHistory[0].groupId;
			}
		} else {
			// Find last event that happened before assignment submission closed
			const lastEventBeforeAssignmentEnd = groupHistory.find(event => 
				event.timestamp.getTime() < assignment.endDate.getTime()
			);

			// If user joined a group before end of assignment, assign joined group
			if (lastEventBeforeAssignmentEnd?.event === UserJoinedGroupEvent.name) {
				groupId = lastEventBeforeAssignmentEnd.groupId;
			}
		}

		// If user was not in a group for the assignment
		if (!groupId) return null;

		const group = await this.groupRepository.getGroupById(groupId);
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
