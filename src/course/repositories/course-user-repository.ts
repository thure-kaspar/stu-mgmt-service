import { Repository, EntityRepository } from "typeorm";
import { User } from "../../shared/entities/user.entity";
import { CourseParticipantsFilter } from "../dto/course/course-participants.filter";
import { CourseId } from "../entities/course.entity";

/**
 * Repository for queries related to course participants.
 */
@EntityRepository(User)
export class CourseUserRepository extends Repository<User> {
	
	/**
	 * Returns the participants of a course.
	 */
	async getUsersOfCourse(courseId: CourseId, filter?: CourseParticipantsFilter): Promise<[User[], number]> {
		const { courseRole, username, skip, take } = filter || { };

		const query = this.createQueryBuilder("user")
			.innerJoinAndSelect("user.courseUserRelations", "courseRelation", "courseRelation.courseId = :courseId", { courseId })
			.skip(skip)
			.take(take);

		if (username) {
			query.andWhere("user.username ILIKE :username", { username: `%${username}%`});
		}
	
		if (courseRole?.length > 0) {
			query.andWhere("courseRelation.role IN (:...courseRole)", { courseRole });
		}

		return query.getManyAndCount();
	}

}
