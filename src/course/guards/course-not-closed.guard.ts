import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Course, CourseId } from "../entities/course.entity";
import { CourseClosedException } from "../exceptions/custom-exceptions";
import { CourseRepository } from "../repositories/course.repository";

/**
 * Only processes the request further, if the course is not closed.
 * 
 * @return `false`, if course is closed.
 */
@Injectable()
export class CourseNotClosedGuard implements CanActivate {
	
	constructor(@InjectRepository(Course) private courseRepo: CourseRepository) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {	
		const request = context.switchToHttp().getRequest();
		const courseId: CourseId = request.params.courseId;

		const course = await this.courseRepo.getCourseById(courseId);

		if (!course.isClosed) {
			return true;
		} else {
			throw new CourseClosedException(courseId);
		}
	}

}
