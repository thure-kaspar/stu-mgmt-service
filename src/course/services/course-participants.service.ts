import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseRole } from "../../shared/enums";
import { toDtos } from "../../shared/interfaces/to-dto.interface";
import { CourseParticipantsFilter } from "../dto/course-participant/course-participants.filter";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { Course, CourseId } from "../entities/course.entity";
import { Participant } from "../entities/participant.entity";
import { CourseClosedException } from "../exceptions/custom-exceptions";
import { CourseRepository } from "../repositories/course.repository";
import { ParticipantRepository } from "../repositories/participant.repository";
import { UserId } from "../../shared/entities/user.entity";

@Injectable()
export class CourseParticipantsService {
	
	constructor(@InjectRepository(Course) private courseRepo: CourseRepository,
				@InjectRepository(Participant) private participantRepo: ParticipantRepository) { }

	/**
	 * Adds the user to the course. 
	 * If the course requires a password, the given password must match the specified password.
	 * Throws exception, if course is closed or password does not match.
	 */
	async addParticipant(courseId: CourseId, userId: UserId, password?: string): Promise<any> { // TODO: don't return any
		const course = await this.courseRepo.getCourseWithConfig(courseId);

		if (course.isClosed) throw new CourseClosedException(course.id);

		// Check if password is required + matches
		const requiredPassword = course.config.password;
		if (requiredPassword && requiredPassword !== password) {
			throw new BadRequestException("The given password was incorrect.");
		}

		return this.participantRepo.createParticipant(courseId, userId, CourseRole.STUDENT);
	}

	async getParticipants(courseId: CourseId, filter?: CourseParticipantsFilter): Promise<[ParticipantDto[], number]> {
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

	async updateRole(courseId: CourseId, userId: UserId, role: CourseRole): Promise<boolean> {
		return this.participantRepo.updateRole(courseId, userId, role);
	}

	async removeUser(courseId: CourseId, userId: UserId): Promise<boolean> {
		return await this.participantRepo.removeUser(courseId, userId);
	}

}
