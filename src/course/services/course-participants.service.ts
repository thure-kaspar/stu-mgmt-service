import { Injectable, BadRequestException } from "@nestjs/common";
import { CourseParticipantsFilter } from "../dto/course/course-participants.filter";
import { UserDto } from "../../shared/dto/user.dto";
import { DtoFactory } from "../../shared/dto-factory";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseUserRepository } from "../repositories/course-user-repository";
import { CourseClosedException } from "../exceptions/custom-exceptions";
import { CourseRole } from "../../shared/enums";
import { Course, CourseId } from "../entities/course.entity";
import { CourseRepository } from "../repositories/course.repository";
import { CourseUserRelation } from "../entities/course-user-relation.entity";
import { CourseUserRelationRepository } from "../repositories/course-user-relation.repository";

@Injectable()
export class CourseParticipantsService {
	
	constructor(@InjectRepository(CourseUserRepository) private courseUserRepo: CourseUserRepository,
				@InjectRepository(Course) private courseRepo: CourseRepository,
				@InjectRepository(CourseUserRelation) private courseUserRelationRepo: CourseUserRelationRepository) { }

	/**
	 * Adds the user to the course. 
	 * If the course requires a password, the given password must match the specified password.
	 * Throws exception, if course is closed or password does not match.
	 */
	async addUser(courseId: CourseId, userId: string, password?: string): Promise<any> { // TODO: don't return any
		const course = await this.courseRepo.getCourseWithConfig(courseId);

		if (course.isClosed) throw new CourseClosedException();

		// Check if password is required + matches
		const requiredPassword = course.config.password;
		if (requiredPassword && requiredPassword !== password) {
			throw new BadRequestException("The given password was incorrect.");
		}

		return this.courseUserRelationRepo.createCourseUserRelation(courseId, userId, CourseRole.STUDENT);
	}

	async getUsersOfCourse(courseId: CourseId, filter?: CourseParticipantsFilter): Promise<[UserDto[], number]> {
		const [users, count] = await this.courseUserRepo.getUsersOfCourse(courseId, filter);
		const userDtos = users.map(user => DtoFactory.createUserDto(user, user.courseUserRelations[0].role));
		return [userDtos, count];
	}

	async updateRole(courseId: CourseId, userId: string, role: CourseRole): Promise<boolean> {
		return this.courseUserRelationRepo.updateRole(courseId, userId, role);
	}

	async removeUser(courseId: CourseId, userId: string): Promise<boolean> {
		return await this.courseUserRelationRepo.removeUser(courseId, userId);
	}

}
