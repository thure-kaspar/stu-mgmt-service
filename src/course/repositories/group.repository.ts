import { Repository, EntityRepository } from "typeorm";
import { Group } from "../entities/group.entity";
import { GroupDto } from "../dto/group/group.dto";
import { UserGroupRelation } from "../entities/user-group-relation.entity";
import { ConflictException } from "@nestjs/common";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { User } from "../../shared/entities/user.entity";
import { CourseId } from "../entities/course.entity";
import { GroupFilter } from "../dto/group/group-filter.dto";

@EntityRepository(Group)
export class GroupRepository extends Repository<Group> {

	/**
	 * Inserts the given group into the database.
	 */
	async createGroup(groupDto: GroupDto): Promise<Group> {
		const group = this.createEntityFromDto(groupDto);
		return this.save(group);
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
		const userGroupRelationRepo = this.manager.getRepository(UserGroupRelation);
		const userGroupRelation = new UserGroupRelation();
		userGroupRelation.groupId = groupId;
		userGroupRelation.userId = userId;
		await userGroupRelationRepo.save(userGroupRelation)
			.catch((error) => {
				if (error.code === "23505")
					throw new ConflictException("This user is already a member of this group.");
			});
		return userGroupRelation ? true : false;
	}

	async getGroupById(groupId: string): Promise<Group> {
		return this.findOneOrFail(groupId);
	}

	/** Returns the group with all relations loaded. */
	async getGroupById_All(groupId: string): Promise<Group> {
		const query = await this.createQueryBuilder("group")
			.where("group.id = :groupId", { groupId })
			.leftJoinAndSelect("group.course", "course")
			.leftJoinAndSelect("group.assessments", "assessment")
			.leftJoinAndSelect("assessment.assignment", "assignment")
			.leftJoinAndSelect("group.userGroupRelations", "userGroupRelation")
			.leftJoinAndSelect("userGroupRelation.user", "user")
			.leftJoinAndSelect("group.history", "history")
			.leftJoinAndSelect("history.user", "history_user")
			.orderBy("history.timestamp", "DESC")
			.getOne();

		if (!query) throw new EntityNotFoundError(Group, null);
		return query;
	}

	async getGroupsByIds(groupIds: string[]): Promise<Group[]> {
		if (groupIds?.length == 0) return [];
		return this.createQueryBuilder("group")
			.whereInIds(groupIds) // TODO: Check what happens if a group does not exist anymore -> Might need to use orWhere instead
			.getMany();
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
	 * Returns all groups that belong to the given course and match the specified filter.
	 * 
	 * Includes relations:
	 * - Group members
	 */
	async getGroupsOfCourse(courseId: CourseId, filter?: GroupFilter): Promise<[Group[], number]> {
		const { name, isClosed, skip, take } = filter || { };

		const query = this.createQueryBuilder("group")
			.where("group.courseId = :courseId", { courseId })
			.leftJoinAndSelect("group.userGroupRelations", "userRelation")
			.leftJoinAndSelect("userRelation.user", "user")
			.skip(skip)
			.take(take);
		
		if (name) {
			query.andWhere("group.name ILIKE :name", { name: `%${name}%` });
		}

		// Allow filtering with isClosed set to TRUE or FALSE
		if (isClosed !== undefined) {
			query.andWhere("group.isClosed = :isClosed", { isClosed });
		}

		return query.getManyAndCount();
	}

	/**
	 * Returns the current group of a user in a course. 
	 * Throws EntityNotFoundError, if no group is found.
	 */
	async getGroupOfUserForCourse(courseId: CourseId, userId: string): Promise<Group> {
		const group = await this.createQueryBuilder("group")
			.where("group.courseId = :courseId", { courseId })
			.innerJoin("group.userGroupRelations", "userRelation")
			.where("userRelation.userId = :userId", { userId })
			.getOne();
		
		if (!group) throw new EntityNotFoundError(Group, null);
		return group;
	}

	/**
	 * Returns an available group name.
	 * Assumes that the course is using a name schema.
	 */
	async getAvailableGroupNameForSchema(courseId: CourseId, schema: string): Promise<string> {
		const query = await this.createQueryBuilder("group")
			.where("group.courseId = :courseId", { courseId })
			.andWhere("group.name ILIKE :schema", { schema })
			.orderBy("group.createdAt", "DESC")
			.getMany();
		
		return "TODO"; // TODO;
	}

	/**
	 * Creates Group-Entities from the given map. Users will be added into the UserGroupRelations.
	 */
	async getRecreatedGroups(groupIdUsersMap: Map<string, User[]>): Promise<Group[]> {
		const groups = await this.getGroupsByIds([...groupIdUsersMap.keys()]);
		groups.forEach(group => {
			group.userGroupRelations = [];
			groupIdUsersMap.get(group.id).forEach(member => {
				const relation = new UserGroupRelation();
				relation.user = member;
				relation.userId = member.id;
				relation.groupId = group.id;
				group.userGroupRelations.push(relation);
			});
		});
		return groups;
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
		
		return this.save(group);
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
