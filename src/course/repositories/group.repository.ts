import { Repository, EntityRepository } from "typeorm";
import { Group } from "../../shared/entities/group.entity";
import { GroupDto } from "../../shared/dto/group.dto";
import { Course } from "../../shared/entities/course.entity";
import { UserGroupRelation } from "../../shared/entities/user-group-relation.entity";

@EntityRepository(Group)
export class GroupRepository extends Repository<Group> {

	async createGroup(course: Course, groupDto: GroupDto): Promise<Group> {
		const group = new Group();
		group.courseId = course.id;
		group.name = groupDto.name;
		group.password = groupDto.password;
		group.isClosed = groupDto.isClosed;
		await group.save();

		return group;
	}

	async addUserToGroup(groupId: string, userId: string): Promise<any> {
		const userGroupRelation = new UserGroupRelation();
		userGroupRelation.groupId = groupId;
		userGroupRelation.userId = userId;
		return await userGroupRelation.save();
	}

	async getGroupWithUsers(groupId: string) {
		return await this.findOne(groupId, {
			relations: ["userGroupRelations", "userGroupRelations.user"]
		});
	}

}