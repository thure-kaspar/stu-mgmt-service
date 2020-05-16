import { Repository, EntityRepository } from "typeorm";
import { GroupEvent } from "../../entities/group-event.entity";

@EntityRepository(GroupEvent)
export class GroupEventRepository extends Repository<GroupEvent> {

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
