import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../../shared/entities/user.entity';
import { UserDto } from '../../shared/dto/user.dto';
import * as fromDtoFactory from "../../shared/dto-factory";
import { CourseDto } from 'src/shared/dto/course.dto';
import { GroupDto } from "../../shared/dto/group.dto";
import { Group } from "../../shared/entities/group.entity";
import { GroupRepository } from "../../course/repositories/group.repository";
import { Assessment } from '../../shared/entities/assessment.entity';
import { AssessmentRepository } from '../../course/repositories/assessment.repository';

@Injectable()
export class UserService {

    constructor(@InjectRepository(User) private userRepository: UserRepository,
				@InjectRepository(Group) private groupRepository: GroupRepository,
				@InjectRepository(Assessment) private assessmentRepository: AssessmentRepository) { }

    async createUser(userDto: UserDto): Promise<UserDto> {
        const createdUser = await this.userRepository.createUser(userDto);
        const createdUserDto = fromDtoFactory.createUserDto(createdUser);
        return createdUserDto;
    }

    async getAllUsers(): Promise<UserDto[]> {
        const userDtos: UserDto[] = [];
        const users = await this.userRepository.getAllUsers();
        users.forEach(user => userDtos.push(fromDtoFactory.createUserDto(user)));
        return userDtos;
    }

    async getUserById(id: string): Promise<UserDto> {
        const user = await this.userRepository.getUserById(id);
        const userDto = fromDtoFactory.createUserDto(user);
        return userDto;
    }

    async getCoursesOfUser(userId: string): Promise<CourseDto[]> {
        const courses = await this.userRepository.getCoursesOfUser(userId);
        const courseDtos: CourseDto[] = [];
        courses.forEach(course => courseDtos.push(fromDtoFactory.createCourseDto(course)));
        return courseDtos;
    }

    /**
	 * Returns a collection of all groups the user was/is part of in the given course.
	 *
	 * @param {string} userId
	 * @param {string} courseId
	 * @returns {Promise<any>}
	 * @memberof UserService
	 */
	async getGroupsOfUserForCourse(userId: string, courseId: string): Promise<any> {
		// Retrieve groups that user is currently a member of
		const currentGroups = await this.groupRepository.getCurrentGroupsOfUserForCourse(courseId, userId);
		const currentGroupDtos: GroupDto[] = [];
		currentGroups.forEach(group => {
			currentGroupDtos.push(fromDtoFactory.createGroupDto(group));
		});

		// Retrieve groups that user was/is a member of by checking assessments
		const assessments = await this.assessmentRepository.getAssessmentsOfUserForCourse_WithGroups(courseId, userId);
	
		// Create [AssignmentId, GroupId]-Map
		const assignmentGroupMap = [];
		assessments.forEach(assessment => {
			// We only care about group-assessments here
			if (assessment.groupId) {
				assignmentGroupMap.push([assessment.assignmentId, assessment.groupId]);
			}
		});

		// TODO: Define a proper format for return value or split in two methods
		return [currentGroupDtos, assignmentGroupMap];
    }
    
}
