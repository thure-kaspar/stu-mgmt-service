import { Repository, EntityRepository } from "typeorm";
import { GroupEvent } from "../../entities/group-event.entity";

@EntityRepository(GroupEvent)
export class GroupEventRepository extends Repository<GroupEvent> {


	/**
	 * Returns all GroupEvents of the course.
	 * Events are sorted by their timestamp in descending order (new to old). 
	 *
	 * @param courseId
	 * @param [before] Allows to exclude all events that happened after the given date.
	 */
	getGroupHistoryOfCourse(courseId: string, before?: Date): Promise<GroupEvent[]> {
		const query = this.createQueryBuilder("event")
			.innerJoin("event.group", "group")
			.where("group.courseId = :courseId", { courseId })
			.innerJoinAndSelect("event.user", "user")
			.orderBy("event.timestamp", "DESC");

		if (before) {
			query.andWhere("event.timestamp < :before", { before });
		}

		return query.getMany(); 
	}

	/**
	 * Returns all GroupEvents of the user in the course.
	 * Events are sorted by their timestamp in descending order (new to old). 
	 */
	getGroupHistoryOfUser(userId: string, courseId: string): Promise<GroupEvent[]> {
		return this.createQueryBuilder("event")
			.innerJoin("event.group", "group")
			.where("event.userId = :userId", { userId })
			.andWhere("group.courseId = :courseId", { courseId })
			.orderBy("event.timestamp", "DESC")
			.getMany();
	}

}
