import { Repository, EntityRepository, QueryBuilder } from "typeorm";
import { Group } from "../../../shared/entities/group.entity";
import { GroupDto } from "../../../shared/dto/group.dto";
import { Course } from "../../../shared/entities/course.entity";
import { UserGroupRelation } from "../../../shared/entities/user-group-relation.entity";
import { ConflictException } from "@nestjs/common";

@EntityRepository(Group)
export class GroupRepository extends Repository<Group> {

	/**
	 * Inserts the given group into the database.
	 */
	async createGroup(groupDto: GroupDto): Promise<Group> {
		const group = this.createEntityFromDto(groupDto);
		return group.save();
	}

	/**
	 * Adds the given user to the group.
	 */
	async addUserToGroup(groupId: string, userId: string): Promise<any> {
		const userGroupRelation = new UserGroupRelation();
		userGroupRelation.groupId = groupId;
		userGroupRelation.userId = userId;
		const savedUserGroupRelation = await userGroupRelation.save()
			.catch((error) => {
				if (error.code === "23505")
					throw new ConflictException("This user is already a member of this group.");
			});
	}

	async getGroupById(groupId: string, ...relations: string[]): Promise<Group> {
		return this.findOneOrFail(groupId, { relations });
	}

	/**
	 * Returns the group with its members.
	 */
	async getGroupWithUsers(groupId: string): Promise<Group> {
		return this.findOneOrFail(groupId, {
			relations: ["course", "userGroupRelations", "userGroupRelations.user"]
		});
	}

	// TODO: Decide, wether query should be split up
	/**
	 * Returns the group including all data that needed by "addUserToGroup".
	 */
	async getGroupForAddUserToGroup(groupId: string, userId: string): Promise<Group> {
		return this.createQueryBuilder("group")
			.where("group.id = :groupId", { groupId }) // Load group
			.leftJoinAndSelect("group.userGroupRelations", "userGroupRelations") // Load userGroupRelations
			.leftJoinAndSelect("group.course", "course") // Load course
			.leftJoinAndSelect("course.config", "config") // Load course config
			.innerJoinAndSelect("config.groupSettings", "groupSettings") // Load group settings (of course config)
			.innerJoinAndSelect("course.courseUserRelations", "relation", "relation.userId = :userId", { userId }) // Load specific course-user
			.getOne();
	}

	/**
	 * Returns all groups, that belong to the given course.
	 *
	 * @param {string} courseId
	 * @returns
	 * @memberof GroupRepository
	 */
	async getGroupsOfCourse(courseId: string): Promise<Group[]> {
		return this.find({
			where: {
				courseId: courseId
			}
		});
	}

	/**
	 * Returns all groups that the user is currently a part of in the given course.
	 */
	async getCurrentGroupsOfUserForCourse(courseId: string, userId: string): Promise<Group[]> {
		return this.find({
			where: {
				courseId: courseId,
				userGroupRelations: {
					userId: userId
				}
			}
		});
	}

	/**
	 * Updates the group. Does not update any included relations.
	 */
	async updateGroup(groupId: string, groupDto: GroupDto): Promise<Group> {
		const group = await this.getGroupById(groupId);
		
		// TODO: Define Patch-Object or create method
		group.name = groupDto.name;
		group.isClosed = groupDto.isClosed;
		group.password = groupDto.password;
		
		return group.save();
	}

	/**
	 * Deletes the group from the database.
	 */
	async deleteGroup(groupId: string): Promise<boolean> {
		const deleteResult = await this.delete(groupId);
		return deleteResult.affected == 1;
	}

	private createEntityFromDto(groupDto: GroupDto): Group {
		const group = new Group();
		group.id = groupDto.id;
		group.courseId = groupDto.courseId;
		group.name = groupDto.name;
		group.password = groupDto.password?.length > 0 ? groupDto.password : null;
		group.isClosed = groupDto.isClosed;
		return group;
	}

}
