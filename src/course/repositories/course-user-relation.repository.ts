import { Repository, EntityRepository } from "typeorm";
import { CourseUserRelation } from "src/shared/entities/course-user-relation.entity";
import { Course } from "src/shared/entities/course.entity";
import { User } from "src/shared/entities/user.entity";

@EntityRepository(CourseUserRelation)
export class CourseUserRelationRepository extends Repository<CourseUserRelation> {
	async addUserToCourse(course: Course, user: User): Promise<CourseUserRelation> {
		const courseUserRelation = new CourseUserRelation();
		courseUserRelation.course = course;
		courseUserRelation.user = user;
		courseUserRelation.role = user.role;
		console.log(courseUserRelation);
		return await courseUserRelation.save();
	}
}