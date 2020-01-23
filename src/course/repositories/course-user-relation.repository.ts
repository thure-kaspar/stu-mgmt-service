import { Repository, EntityRepository } from "typeorm";
import { CourseUserRelation } from "../../shared/entities/course-user-relation.entity";
import { Course } from "../../shared/entities/course.entity";
import { User } from "../../shared/entities/user.entity";

@EntityRepository(CourseUserRelation)
export class CourseUserRelationRepository extends Repository<CourseUserRelation> {
	
	async addUserToCourse(course: Course, user: User): Promise<CourseUserRelation> {
		const courseUserRelation = new CourseUserRelation();
		courseUserRelation.course = course;
		courseUserRelation.user = user;
		courseUserRelation.role = user.role;

		return await courseUserRelation.save();
	}
}
