import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "../repositories/user.repository";
import { User } from "../../shared/entities/user.entity";
import { UserDto } from "../../shared/dto/user.dto";
import { CourseDto } from "src/course/dto/course/course.dto";
import { GroupDto } from "../../course/dto/group/group.dto";
import { Group } from "../../course/entities/group.entity";
import { GroupRepository } from "../../course/repositories/group.repository";
import { Assessment } from "../../course/entities/assessment.entity";
import { AssessmentRepository } from "../../course/repositories/assessment.repository";
import { AssessmentDto } from "../../course/dto/assessment/assessment.dto";
import { DtoFactory } from "../../shared/dto-factory";
import { Assignment } from "../../course/entities/assignment.entity";
import { AssignmentRepository } from "../../course/repositories/assignment.repository";
import { GroupEvent } from "../../course/entities/group-event.entity";
import { GroupEventDto } from "../../course/dto/group/group-event.dto";
import { GroupEventRepository } from "../../course/repositories/group-event.repository";
import { UserJoinedGroupEvent } from "../../course/events/user-joined-group.event";
import { CollaborationType } from "../../shared/enums";
import { AssignmentDto } from "../../course/dto/assignment/assignment.dto";
import { AssignmentGroupTuple } from "../dto/assignment-group-tuple.dto";
import { CourseId } from "../../course/entities/course.entity";

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
	async getGroupOfUserForCourse(userId: string, courseId: CourseId): Promise<GroupDto> {
		const group = await this.groupRepository.getGroupOfUserForCourse(courseId, userId);
		return DtoFactory.createGroupDto(group);
	}

	/**
	 * Returns all group events of the user in the course.
	 * Events are sorted by their timestamp in descending order (new to old). 
	 */
	async getGroupHistoryOfUser(userId: string, courseId: CourseId): Promise<GroupEventDto[]> {
		const history = await this.groupEventRepository.getGroupHistoryOfUser(userId, courseId);
		return history.map(event => event.toDto());
	}

	/**
	 * Returns the group that the user was a member of when the assignment submission closed.
	 */
	async getGroupOfAssignment(userId: string, courseId: CourseId, assignmentId: string): Promise<GroupDto> {
		const [groupHistory, assignment] = await Promise.all([
			this.groupEventRepository.getGroupHistoryOfUser(userId, courseId),
			this.assignmentRepository.getAssignmentById(assignmentId)
		]);

		const groupId = this.findGroupOfAssignment(groupHistory, assignment);

		// If user was not in a group for the assignment
		if (!groupId) return null;

		const group = await this.groupRepository.getGroupById(groupId);
		return DtoFactory.createGroupDto(group);
	}

	/**
	 * Returns the groups that the user was a member of when the assignment submission closed 
	 * or the current group, if no end date is specified, for all assignments of a course.
	 */
	async getGroupOfAllAssignments(userId: string, courseId: CourseId): Promise<AssignmentGroupTuple[]> {
		const [groupHistory, assignments] = await Promise.all([
			this.groupEventRepository.getGroupHistoryOfUser(userId, courseId),
			this.assignmentRepository.getAssignments(courseId)
		]);

		// Find group for every assignment
		const assignmentToGroupId: Array<[Assignment, string]> = [];
		assignments.forEach(a => assignmentToGroupId.push([a, this.findGroupOfAssignment(groupHistory, a)]));
		
		// Load groups
		const groupIds = assignmentToGroupId.filter(entry => entry[1] !== null).map(entry => entry[1]);
		const groups = await this.groupRepository.getGroupsByIds(groupIds);

		// Transform to Tuples
		const result: AssignmentGroupTuple[] = [];
		assignmentToGroupId.forEach(entry => {
			const [assignment, groupId] = entry;
			const group = groups.find(g => g.id === groupId);
			const groupDto = group ? DtoFactory.createGroupDto(group) : null;

			result.push({
				assignment: DtoFactory.createAssignmentDto(assignment),
				group: groupDto
			});
		});
		return result;
	}

	/**
	 * Algorithm that finds the user's group for an assignment.
	 * Returns the groupId.
	 * Returns null, if user was not in a group or groups were not allowed.
	 */
	private findGroupOfAssignment(groupHistory: GroupEvent[], assignment: Assignment): string {
		if (groupHistory.length == 0) return null; // If user never joined a group
		if (assignment.collaboration === CollaborationType.SINGLE) return null; // If groups were disallowed

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
		return groupId;
	}

	async getAssessmentsOfUserForCourse(userId: string, courseId: CourseId): Promise<AssessmentDto[]> {
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
