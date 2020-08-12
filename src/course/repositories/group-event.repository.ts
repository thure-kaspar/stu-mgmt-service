import { Repository, EntityRepository } from "typeorm";
import { GroupEvent } from "../entities/group-event.entity";
import { CourseId } from "../entities/course.entity";
import { GroupId } from "../entities/group.entity";
import { UserId } from "../../shared/entities/user.entity";

@EntityRepository(GroupEvent)
export class GroupEventRepository extends Repository<GroupEvent> {


	/**
	 * Returns all GroupEvents of the course.
	 * Events are sorted by their timestamp in descending order (new to old). 
	 *
	 * @param courseId
	 * @param [before] Allows to exclude all events that happened after the given date.
	 */
	getGroupHistoryOfCourse(courseId: CourseId, before?: Date): Promise<GroupEvent[]> {
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
	 * 
	 * @param courseId
	 * @param [before] Allows to exclude all events that happened after the given date.
	 */
	getGroupHistoryOfUser(userId: UserId, courseId: CourseId, before?: Date): Promise<GroupEvent[]> {
		const query = this.createQueryBuilder("event")
			.innerJoin("event.group", "group")
			.where("event.userId = :userId", { userId })
			.andWhere("group.courseId = :courseId", { courseId })
			.orderBy("event.timestamp", "DESC");

		if (before) {
			query.andWhere("event.timestamp < :before", { before });
		}

		return query.getMany();
	}

	/**
	 * Returns all GroupEvents of a group.
	 * Users are included in the event entities.
	 * Events are sorted by their timestamp in descending order (new to old).
	 * 
	 * @param groupId
	 * @param [before] Allows to exclude all events that happened after the given date.
	 */
	getGroupHistoryOfGroup(groupId: GroupId, before?: Date): Promise<GroupEvent[]> {
		const query = this.createQueryBuilder("event")
			.where("event.groupId = :groupId", { groupId })
			.innerJoinAndSelect("event.user", "user")
			.orderBy("event.timestamp", "DESC");

		if (before) {
			query.andWhere("event.timestamp < :before", { before });
		}

		return query.getMany();
	}

}
