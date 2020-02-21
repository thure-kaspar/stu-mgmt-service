import { Repository, EntityRepository } from "typeorm";
import { CourseUserRelation } from "../../shared/entities/course-user-relation.entity";
import { Course } from "../../shared/entities/course.entity";
import { User } from "../../shared/entities/user.entity";
import { UserRoles } from "../../shared/enums";

@EntityRepository(CourseUserRelation)
export class CourseUserRelationRepository extends Repository<CourseUserRelation> {
	
	async addUserToCourse(courseId: string, userId: string, role: UserRoles): Promise<CourseUserRelation> {
		const courseUserRelation = new CourseUserRelation();
		courseUserRelation.courseId = courseId;
		courseUserRelation.userId = userId;
		courseUserRelation.role = role

		return await courseUserRelation.save();
	}
}
