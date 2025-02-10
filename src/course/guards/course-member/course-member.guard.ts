import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { CourseRepository } from "../../repositories/course.repository";
import { checkIsCourseMemberOrAdmin } from "./impl";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

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
	constructor(private dataSource: DataSource) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		await checkIsCourseMemberOrAdmin(request, new CourseRepository(this.dataSource));
		return true;
	}
}
