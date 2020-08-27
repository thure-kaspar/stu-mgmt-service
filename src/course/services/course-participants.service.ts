import { BadRequestException, Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { UserId } from "../../shared/entities/user.entity";
import { CourseRole } from "../../shared/enums";
import { toDtos } from "../../shared/interfaces/to-dto.interface";
import { CourseParticipantsFilter } from "../dto/course-participant/course-participants.filter";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { Course as CourseEntity, CourseId } from "../entities/course.entity";
import { Participant as ParticipantEntity } from "../entities/participant.entity";
import { CourseJoined } from "../events/participant/course-joined.event";
import { CourseClosedException } from "../exceptions/custom-exceptions";
import { CourseWithGroupSettings } from "../models/course-with-group-settings.model";
import { Participant } from "../models/participant.model";
import { CourseRepository } from "../repositories/course.repository";
import { ParticipantRepository } from "../repositories/participant.repository";

@Injectable()
export class CourseParticipantsService {
	
	constructor(@InjectRepository(CourseEntity) private courseRepo: CourseRepository,
				@InjectRepository(ParticipantEntity) private participantRepo: ParticipantRepository,
				private events: EventBus) { }

	/**
	 * Adds the user to the course. 
	 * If the course requires a password, the given password must match the specified password.
	 * Throws exception, if course is closed or password does not match.
	 */
	async addParticipant(courseId: CourseId, userId: UserId, password?: string): Promise<void> {
		const course = await this.courseRepo.getCourseWithConfigAndGroupSettings(courseId);

		if (course.isClosed) throw new CourseClosedException(course.id);

		// Check if password is required + matches
		const requiredPassword = course.config.password;
		if (requiredPassword && requiredPassword !== password) {
			throw new BadRequestException("The given password was incorrect.");
		}

		const participant = await this.participantRepo.createParticipant(courseId, userId, CourseRole.STUDENT);

		const courseModel = new CourseWithGroupSettings(course, course.config.groupSettings);
		this.events.publish(new CourseJoined(courseModel, new Participant(participant)));
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
