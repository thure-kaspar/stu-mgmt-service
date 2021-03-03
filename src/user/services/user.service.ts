import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseDto } from "src/course/dto/course/course.dto";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { AssessmentDto } from "../../course/dto/assessment/assessment.dto";
import { GroupEventDto } from "../../course/dto/group/group-event.dto";
import { GroupDto } from "../../course/dto/group/group.dto";
import { Assessment } from "../../course/entities/assessment.entity";
import { AssignmentRegistration } from "../../course/entities/assignment-group-registration.entity";
import { Assignment, AssignmentId } from "../../course/entities/assignment.entity";
import { CourseId } from "../../course/entities/course.entity";
import { GroupEvent } from "../../course/entities/group-event.entity";
import { Group } from "../../course/entities/group.entity";
import { Participant } from "../../course/models/participant.model";
import { AssessmentRepository } from "../../course/repositories/assessment.repository";
import { AssignmentRegistrationRepository } from "../../course/repositories/assignment-registration.repository";
import { AssignmentRepository } from "../../course/repositories/assignment.repository";
import { GroupEventRepository } from "../../course/repositories/group-event.repository";
import { GroupRepository } from "../../course/repositories/group.repository";
import { DtoFactory } from "../../shared/dto-factory";
import { UserDto, UserUpdateDto } from "../../shared/dto/user.dto";
import { User, UserId } from "../../shared/entities/user.entity";
import { AssignmentState } from "../../shared/enums";
import { AssignmentGroupTuple } from "../dto/assignment-group-tuple.dto";
import { UserFilter } from "../dto/user.filter";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private userRepository: UserRepository,
		@InjectRepository(Group) private groupRepository: GroupRepository,
		@InjectRepository(Assignment) private assignmentRepository: AssignmentRepository,
		@InjectRepository(Assessment) private assessmentRepository: AssessmentRepository,
		@InjectRepository(GroupEvent) private groupEventRepository: GroupEventRepository,
		@InjectRepository(AssignmentRegistration)
		private registrations: AssignmentRegistrationRepository
	) {}

	async createUser(userDto: UserDto): Promise<UserDto> {
		const createdUser = await this.userRepository.createUser(userDto);
		const createdUserDto = DtoFactory.createUserDto(createdUser);
		return createdUserDto;
	}

	async getUsers(filter?: UserFilter): Promise<[UserDto[], number]> {
		const [users, count] = await this.userRepository.getUsers(filter);
		return [users.map(user => DtoFactory.createUserDto(user)), count];
	}

	async getUserById(id: string): Promise<UserDto> {
		const user = await this.userRepository.getUserById(id);
		return DtoFactory.createUserDto(user);
	}

	async getUserByEmail(email: string): Promise<UserDto> {
		const user = await this.userRepository.getUserByEmail(email);
		return DtoFactory.createUserDto(user);
	}

	async getCoursesOfUser(userId: UserId): Promise<CourseDto[]> {
		const courses = await this.userRepository.getCoursesOfUser(userId);
		return courses.map(c => DtoFactory.createCourseDto(c));
	}

	/**
	 * Returns the current group of a user in a course.
	 */
	async getGroupOfUserForCourse(userId: UserId, courseId: CourseId): Promise<GroupDto> {
		const group = await this.groupRepository.getGroupOfUserForCourse(courseId, userId);
		return DtoFactory.createGroupDto(group);
	}

	/**
	 * Returns all group events of the user in the course.
	 * Events are sorted by their timestamp in descending order (new to old).
	 */
	async getGroupHistoryOfUser(userId: UserId, courseId: CourseId): Promise<GroupEventDto[]> {
		const history = await this.groupEventRepository.getGroupHistoryOfUser(userId, courseId);
		return history.map(event => event.toDto());
	}

	/**
	 * Returns the group that the user was a registered member of.
	 */
	async getGroupOfAssignment(
		userId: UserId,
		courseId: CourseId,
		assignmentId: string
	): Promise<GroupDto> {
		return this.registrations.getRegisteredGroupOfUser(assignmentId, userId);
	}

	/**
	 * Returns tuples mapping assignments to the user's registered groups.
	 */
	async getGroupOfAllAssignments(
		userId: UserId,
		courseId: CourseId
	): Promise<AssignmentGroupTuple[]> {
		return this.registrations.getAllRegisteredGroupsOfUserInCourse(courseId, userId);
	}

	/**
	 * Return the user's assessment for the specified assignment.
	 * If `participant` is `STUDENT`, the assignment must be in `EVALUATED` state.
	 * @throws `EntityNotFoundError` if assessment does not exists, or it exists but requested by `STUDENT`
	 * and not `EVALUATED`.
	 */
	async getAssessment(
		participant: Participant,
		assignmentId: AssignmentId
	): Promise<AssessmentDto> {
		if (participant.isStudent()) {
			// Only return assessment, if the assignment is in EVALUATED state
			const assignment = await this.assignmentRepository.getAssignmentById(assignmentId);
			if (assignment.state !== AssignmentState.EVALUATED) {
				throw new EntityNotFoundError(AssessmentDto, {
					assignmentId,
					userId: participant.userId
				});
			}
		}

		const [assessments] = await this.assessmentRepository.getAssessmentsForAssignment(
			assignmentId,
			{
				userId: participant.userId
			}
		);

		if (assessments.length == 0) {
			throw new EntityNotFoundError(AssessmentDto, {
				assignmentId,
				userId: participant.userId
			});
		}

		return DtoFactory.createAssessmentDto(assessments[0]);
	}

	async getAssessmentsOfUserForCourse(
		userId: UserId,
		courseId: CourseId
	): Promise<AssessmentDto[]> {
		const assessments = await this.assessmentRepository.getAssessmentsOfUserForCourse(
			courseId,
			userId
		);
		const evaluated = assessments.filter(a => a.assignment.state === AssignmentState.EVALUATED);
		return evaluated.map(a => DtoFactory.createAssessmentDto(a));
	}

	async updateUser(userId: UserId, userDto: UserUpdateDto): Promise<UserDto> {
		const user = await this.userRepository.updateUser(userId, userDto);
		return DtoFactory.createUserDto(user);
	}

	async deleteUser(userId: UserId): Promise<boolean> {
		return this.userRepository.deleteUser(userId);
	}
}
