import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseRepository } from "../../repositories/course.repository";
import { Course, CourseId } from "../../entities/course.entity";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { CanJoinCourseDto } from "./can-join-course.dto";

export class CanJoinCourseQuery { 
	constructor(
		public readonly courseId: CourseId, 
		public readonly userId: string
	) { }
}

@QueryHandler(CanJoinCourseQuery)
export class CanJoinCourseHandler implements IQueryHandler<CanJoinCourseQuery> {

	constructor(@InjectRepository(Course) private courseRepo: CourseRepository) { }

	async execute(query: CanJoinCourseQuery): Promise<CanJoinCourseDto> {
		// Load course, courseConfig and join user if he's a member
		const course = await this.courseRepo.createQueryBuilder("course")
			.where("course.id = :courseId", { courseId: query.courseId })
			.innerJoinAndSelect("course.config", "config", "config.courseId = :courseId", { courseId: query.courseId })
			.leftJoinAndSelect("course.participants", "userRelation", "userRelation.userId = :userId", { userId: query.userId })
			.getOne();

		if (!course) throw new EntityNotFoundError(Course, null);
		
		if (course.participants.length == 1) {
			// User is already a member of the course
			return {
				canJoin: false,
				reason: "IS_MEMBER"	
			};
		}

		if (course.isClosed) {
			// Course is closed
			return {
				canJoin: false,
				reason: "CLOSED"
			};
		}

		// User can join the course
		return {
			canJoin: true,
			requiresPassword: course.config.password ? true : false
		};
	}

}
