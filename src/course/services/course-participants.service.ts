import { ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { UserDto } from "../../shared/dto/user.dto";
import { UserId } from "../../shared/entities/user.entity";
import { CourseRole, isAdmin } from "../../shared/enums";
import { toDtos } from "../../shared/interfaces/to-dto.interface";
import { CourseParticipantsFilter } from "../dto/course-participant/course-participants.filter";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { CourseId } from "../entities/course.entity";
import { CourseJoined } from "../events/participant/course-joined.event";
import { CourseClosedException, InvalidPasswordException } from "../exceptions/custom-exceptions";
import { CourseWithGroupSettings } from "../models/course-with-group-settings.model";
import { Participant } from "../models/participant.model";
import { CourseRepository } from "../repositories/course.repository";
import { ParticipantRepository } from "../repositories/participant.repository";

@Injectable()
export class CourseParticipantsService {
	constructor(
		@InjectRepository(CourseRepository) private courseRepo: CourseRepository,
		@InjectRepository(ParticipantRepository) private participantRepo: ParticipantRepository,
		private events: EventBus
	) {}

	/**
	 * Adds the user to the course.
	 * If the course requires a password, the given password must match the specified password.
	 * Throws exception, if course is closed or password does not match.
	 */
	async addParticipant(
		requestingUser: UserDto,
		courseId: CourseId,
		targetUserId: UserId,
		password?: string
	): Promise<void> {
		const { isAdminOrLecturer } = await this.checkIfUserCanAddParticipant(
			courseId,
			targetUserId,
			requestingUser
		);

		const course = await this.courseRepo.getCourseWithConfigAndGroupSettings(courseId);

		if (!isAdminOrLecturer) {
			if (course.isClosed) throw new CourseClosedException(course.id);

			// Check if password is required + matches
			const requiredPassword = course.config.password;
			if (requiredPassword && requiredPassword !== password) {
				throw new InvalidPasswordException();
			}
		}

		const participant = await this.participantRepo.createParticipant(
			courseId,
			targetUserId,
			CourseRole.STUDENT
		);

		const courseModel = new CourseWithGroupSettings(course, course.config.groupSettings);
		this.events.publish(new CourseJoined(courseModel, new Participant(participant)));
	}

	/**
	 * Checks, if the user with `userId` may be added to the course by the `requestingUser`.
	 * Throws an appropriate exception, when this operation is not allowed.
	 *
	 * - Lecturers and Admins may add other users to a course
	 * - Normal users can only add themselves
	 */
	private async checkIfUserCanAddParticipant(
		courseId: string,
		targetUserId: string,
		requestingUser: UserDto
	): Promise<{ isAdminOrLecturer: boolean }> {
		const requestingParticipant = await this.participantRepo.tryGetParticipant(
			courseId,
			requestingUser.id
		);

		if (requestingParticipant) {
			const isAlreadyInCourse = requestingParticipant.userId === targetUserId;
			if (isAlreadyInCourse) {
				throw new ConflictException(
					`User (${targetUserId}) is already a member of course (${courseId}).`
				);
			}

			const canAddOthers =
				isAdmin(requestingUser.role) || requestingParticipant.role === CourseRole.LECTURER;
			if (!canAddOthers) {
				throw new ForbiddenException("Users can not add other users to courses.");
			}
		}

		if (!requestingParticipant) {
			const isAddingAnotherUser = requestingUser.id !== targetUserId;
			if (isAddingAnotherUser && !isAdmin(requestingUser.role)) {
				throw new ForbiddenException("Users can not add other users to courses.");
			}
		}

		return {
			isAdminOrLecturer:
				requestingParticipant?.role === CourseRole.LECTURER || isAdmin(requestingUser.role)
		};
	}

	async getParticipants(
		courseId: CourseId,
		filter?: CourseParticipantsFilter
	): Promise<[ParticipantDto[], number]> {
		const [participants, count] = await this.participantRepo.getParticipants(courseId, filter);
		return [toDtos(participants), count];
	}

	/**
	 * Returns a specific participant of a course.
	 *
	 * Includes relations:
	 * - Group (if exists, includes members)
	 */
	async getParticipant(courseId: CourseId, userId: UserId): Promise<ParticipantDto> {
		const participant = await this.participantRepo.getParticipant(courseId, userId);
		return participant.toDto();
	}

	async getParticipantsByMatrNr(
		courseId: CourseId,
		matrNrs: number[]
	): Promise<ParticipantDto[]> {
		const participants = await this.participantRepo.getParticipantsByMatrNr(courseId, matrNrs);
		return participants.map(p => p.toDto());
	}

	async updateRole(courseId: CourseId, userId: UserId, role: CourseRole): Promise<boolean> {
		return this.participantRepo.updateRole(courseId, userId, role);
	}

	async removeUser(courseId: CourseId, userId: UserId): Promise<boolean> {
		return await this.participantRepo.removeUser(courseId, userId);
	}
}
