import { Repository, EntityRepository } from "typeorm";
import { Group } from "../../entities/group.entity";
import { GroupDto } from "../../dto/group/group.dto";
import { UserGroupRelation } from "../../entities/user-group-relation.entity";
import { ConflictException } from "@nestjs/common";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";

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
	 * Inserts the given groups into the database.
	 */
	async createMultipleGroups(groupDtos: GroupDto[]): Promise<Group[]> {
		const groups = groupDtos.map(g => this.createEntityFromDto(g));
		return this.save(groups);
	}

	/**
	 * Adds the given user to the group.
	 */
	async addUserToGroup(groupId: string, userId: string): Promise<boolean> {
		const userGroupRelation = new UserGroupRelation();
		userGroupRelation.groupId = groupId;
		userGroupRelation.userId = userId;
		await userGroupRelation.save()
			.catch((error) => {
				if (error.code === "23505")
					throw new ConflictException("This user is already a member of this group.");
			});
		return userGroupRelation ? true : false;
	}

	async getGroupById(groupId: string, ...relations: string[]): Promise<Group> {
		return this.findOneOrFail(groupId, { relations });
	}

	/** Returns the group with all relations loaded. */
	async getGroupById_All(groupId: string): Promise<Group> {
		return this.findOneOrFail(groupId, {
			relations: ["course", "assessments", "userGroupRelations", "userGroupRelations.user", "history"]
		});
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
	 * Returns the group including all data that needed by "addUserToGroup" (i.e group members and course settings).
	 * Throws error, if user is not a member of the group's course.
	 */
	async getGroupForAddUserToGroup(groupId: string, userId: string): Promise<Group> {
		const group = await this.createQueryBuilder("group")
			.where("group.id = :groupId", { groupId }) // Load group
			.leftJoinAndSelect("group.userGroupRelations", "userGroupRelations") // Load userGroupRelations
			.leftJoinAndSelect("group.course", "course") // Load course
			.leftJoinAndSelect("course.config", "config") // Load course config
			.innerJoinAndSelect("config.groupSettings", "groupSettings") // Load group settings (of course config)
			.innerJoinAndSelect("course.courseUserRelations", "relation", "relation.userId = :userId", { userId }) // Load specific course-user, error if not a member of course
			.getOne();
		
		if (!group) throw new EntityNotFoundError(Group, null);
		return group;
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
			where: { courseId },
			relations: ["userGroupRelations", "userGroupRelations.user"],
		});
	}

	/**
	 * Returns all groups that the user is currently a part of in the given course.
	 */
	async getCurrentGroupsOfUserForCourse(courseId: string, userId: string): Promise<Group[]> {
		return this.createQueryBuilder("group")
			.where("group.courseId = :courseId", { courseId })
			.innerJoin("group.userGroupRelations", "userRelation")
			.where("userRelation.userId = :userId", { userId })
			.getMany();
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

	async removeUser(groupId: string, userId: string): Promise<boolean> {
		const removed = await this.manager.getRepository(UserGroupRelation).delete({ groupId, userId });
		return removed.affected == 1;
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
		group.courseId = groupDto.courseId;
		group.name = groupDto.name;
		group.password = groupDto.password?.length > 0 ? groupDto.password : null;
		group.isClosed = groupDto.isClosed;
		return group;
	}

}
