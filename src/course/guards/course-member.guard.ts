import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { UserDto } from "../../shared/dto/user.dto";
import { Course as CourseEntity, CourseId } from "../entities/course.entity";
import { NotACourseMemberException } from "../exceptions/custom-exceptions";
import { CourseRepository } from "../repositories/course.repository";
import { Course } from "../models/course.model";
import { Participant } from "../models/participant.model";

/**
 * Only allows requests for users, that are members of the course.
 * Assumes that request body has requesting `user` attached to it (done by `AuthGuard`).
 * Attaches `participant` and `course` to the request to allow following guards or controllers to access
 * information about this participant (i.e. `role`) and course (i.e. `isClosed`).
 *
 * @throws `NotACourseMemberException`
 */
@Injectable()
export class CourseMemberGuard implements CanActivate {
	constructor(@InjectRepository(CourseEntity) private courses: CourseRepository) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user: UserDto = request.user;
		const courseId: CourseId = request.params.courseId;

		try {
			const course = await this.courses.getCourseWithParticipant(courseId, user.id);
			request.participant = new Participant(course.participants[0]);
			course.participants = undefined;
			request.course = new Course(course);
			return true;
		} catch (error) {
			if (error instanceof EntityNotFoundError) {
				throw new NotACourseMemberException(courseId, user.id);
			}
		}

		return false;
	}
}
