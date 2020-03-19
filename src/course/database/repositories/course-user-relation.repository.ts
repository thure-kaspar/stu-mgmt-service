import { ConflictException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { CourseUserRelation } from "../../../shared/entities/course-user-relation.entity";
import { CourseRole } from "../../../shared/enums";

@EntityRepository(CourseUserRelation)
export class CourseUserRelationRepository extends Repository<CourseUserRelation> {
	
	async createCourseUserRelation(courseId: string, userId: string, role: CourseRole): Promise<CourseUserRelation> {
		const courseUserRelation = new CourseUserRelation();
		courseUserRelation.courseId = courseId;
		courseUserRelation.userId = userId;
		courseUserRelation.role = role;

		await courseUserRelation.save()
			.catch((error) => {
				if (error.code === "23505") { // TODO: Store error codes in enum
					throw new ConflictException("This user is already signed up to the course.");
				}
			});

		return courseUserRelation;
	}

	async updateRole(courseId: string, userId: string, role: CourseRole): Promise<boolean> {
		const result = await this.update({ courseId, userId }, { role: role});
		return result.affected == 1;
	}
}
