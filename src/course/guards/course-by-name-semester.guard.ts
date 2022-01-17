import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseRepository } from "../repositories/course.repository";

/**
 * Looks up a course by `name` and `semester` (from `request.params`) and attaches the `courseId` to
 * `request.params`, which enables following guards to perform checks based on the `courseId`.
 * Always returns `true`.
 * Throws an exception, if course was not found.
 */
@Injectable()
export class CourseByNameAndSemesterGuard implements CanActivate {
	constructor(@InjectRepository(CourseRepository) private courses: CourseRepository) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const { name, semester } = request.params;

		const course = await this.courses.getCourseByNameAndSemester(name, semester);
		request.params = {
			...request.params,
			courseId: course.id
		};

		return true;
	}
}
