import { Repository, EntityRepository } from "typeorm";
import { User } from "../../shared/entities/user.entity";
import { CourseParticipantsFilter } from "../dto/course/course-participants.filter";
import { CourseId } from "../entities/course.entity";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";

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

	/**
	 * Returns a specific participant of a course.
	 * Throws `EntityNotFoundError` if participant does not exist.
	 * 
	 * Includes relations:
	 * - Group (if exists, includes members)
	 */
	async getParticipant(courseId: CourseId, userId: string): Promise<User> {
		const query = await this.createQueryBuilder("user")
			.where("user.id = :userId", { userId })
			.innerJoinAndSelect("user.courseUserRelations", "courseRelation", "courseRelation.courseId = :courseId", { courseId })
			.leftJoinAndSelect("user.userGroupRelations", "groupRelation")
			.leftJoinAndSelect("groupRelation.group", "group")
			.leftJoinAndSelect("group.userGroupRelations", "userGroupRelation")
			.leftJoinAndSelect("userGroupRelation.user", "groupmember")
			.getOne();

		if (!query) {
			throw new EntityNotFoundError(User, { courseId, userId });
		}
		return query;
	}

}
