import { ConflictException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { User, UserId } from "../../shared/entities/user.entity";
import { GroupFilter } from "../dto/group/group-filter.dto";
import { GroupDto, GroupUpdateDto } from "../dto/group/group.dto";
import { CourseId } from "../entities/course.entity";
import { Group, GroupId } from "../entities/group.entity";
import { UserGroupRelation } from "../entities/user-group-relation.entity";
import { ParticipantRepository } from "./participant.repository";
import { Participant } from "../entities/participant.entity";
import { CourseRole } from "../../shared/enums";

@EntityRepository(Group)
export class GroupRepository extends Repository<Group> {

	/**
	 * Inserts the given group into the database.
	 */
	async createGroup(courseId: CourseId, groupDto: GroupDto): Promise<Group> {
		const group = this.createEntityFromDto(courseId, groupDto);
		return this.save(group);
	}

	/**
	 * Inserts the given groups into the database.
	 */
	async createMultipleGroups(courseId: CourseId, groupDtos: GroupDto[]): Promise<Group[]> {
		const groups = groupDtos.map(g => this.createEntityFromDto(courseId, g));
		return this.save(groups);
	}

	/**
	 * Adds the given user to the group.
	 */
	async addUserToGroup(courseId: CourseId, groupId: GroupId, userId: UserId): Promise<boolean> {
		const userGroupRelationRepo = this.manager.getRepository(UserGroupRelation);
		const participantRepo = this.manager.getCustomRepository(ParticipantRepository);

		const participant = await participantRepo.getParticipant(courseId, userId);

		const userGroupRelation = new UserGroupRelation();
		userGroupRelation.groupId = groupId;
		userGroupRelation.userId = userId;
		userGroupRelation.participantId = participant.id;
		await userGroupRelationRepo.save(userGroupRelation)
			.catch((error) => {
				if (error.code === "23505")
					throw new ConflictException("This user is already a member of this group.");
			});
		return userGroupRelation ? true : false;
	}

	async getGroupById(groupId: GroupId): Promise<Group> {
		return this.findOneOrFail(groupId);
	}

	/** Returns the group with all relations loaded. */
	async getGroupById_All(groupId: GroupId): Promise<Group> {
		const query = await this.createQueryBuilder("group")
			.where("group.id = :groupId", { groupId })
			.leftJoinAndSelect("group.course", "course")
			.leftJoinAndSelect("group.assessments", "assessment")
			.leftJoinAndSelect("assessment.assignment", "assignment")
			.leftJoinAndSelect("group.userGroupRelations", "userGroupRelation")
			.leftJoinAndSelect("userGroupRelation.participant", "participant")
			.leftJoinAndSelect("participant.user", "user")
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
	async getGroupWithUsers(groupId: GroupId): Promise<Group> {
		return this.findOneOrFail(groupId, {
			relations: ["course", "userGroupRelations", "userGroupRelations.participant", "userGroupRelations.participant.user"]
		});
	}

	// TODO: Decide, wether query should be split up
	/**
	 * Returns the group including all data that needed by "addUserToGroup" (i.e group members and course settings).
	 * Throws error, if user is not a member of the group's course.
	 */
	async getGroupForAddUserToGroup(groupId: GroupId, userId: UserId): Promise<Group> {
		const group = await this.createQueryBuilder("group")
			.where("group.id = :groupId", { groupId }) // Load group
			.leftJoinAndSelect("group.userGroupRelations", "userGroupRelations") // Load userGroupRelations
			.leftJoinAndSelect("group.course", "course") // Load course
			.leftJoinAndSelect("course.config", "config") // Load course config
			.innerJoinAndSelect("config.groupSettings", "groupSettings") // Load group settings (of course config)
			.innerJoinAndSelect("course.participants", "relation", "relation.userId = :userId", { userId }) // Load specific course-user, error if not a member of course
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
		const { name, isClosed, minSize, maxSize, skip, take } = filter || { };

		const query = this.createQueryBuilder("group")
			.where("group.courseId = :courseId", { courseId })
			.leftJoinAndSelect("group.userGroupRelations", "userRelation")
			.leftJoinAndSelect("userRelation.participant", "participant")
			.leftJoinAndSelect("participant.user", "user")
			.orderBy("group.name", "ASC")
			.skip(skip)
			.take(take);
		
		if (name) {
			query.andWhere("group.name ILIKE :name", { name: `%${name}%` });
		}

		// Allow filtering with isClosed set to TRUE or FALSE
		if (isClosed !== undefined) {
			query.andWhere("group.isClosed = :isClosed", { isClosed });
		}

		if (minSize || maxSize) {
			query.loadRelationCountAndMap("group.size", "group.userGroupRelations");
			if (minSize) {
				query.andWhere("size >= :minSize", { minSize });
			}
			if (maxSize) {
				query.andWhere("size <= :maxSize", { maxSize });
			}
		}

		return query.getManyAndCount();
	}

	/**
	 * Returns the current group of a user in a course. 
	 * Throws EntityNotFoundError, if no group is found.
	 */
	async getGroupOfUserForCourse(courseId: CourseId, userId: UserId): Promise<Group> {
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
		const groups = await this.createQueryBuilder("group")
			.where("group.courseId = :courseId", { courseId })
			.andWhere("group.name ILIKE :schema", { schema: `%${schema}%` })
			.orderBy("group.createdAt", "DESC")
			.getMany();
		
		return this.tryFindAvailableName(groups, schema);
	}

	/**
	 * TODO: Implement something better, this is a temporary solution
	 * Tries to add number from 1-9999 to group schema. Returns first available name. If no name is available, throws Error.
	 */
	private tryFindAvailableName(groups: Group[], schema: string): string {
		for (let i = 1; i <= 9999; i++) {
			let suggestion = schema;

			if (i < 10) {
				suggestion += "00" + i.toString(); // i.e. JP001
			} else if (i < 100) {
				suggestion += "0" + i.toString(); // i.e. JP010
			} else {
				suggestion += i.toString(); // i.e. JP100
			}

			if (!groups.find(group => group.name === suggestion)) {
				return suggestion;
			}
		}

		throw Error("No available group name.");
	}

	/**
	 * Updates the group. Does not update any included relations.
	 */
	async updateGroup(groupId: GroupId, update: GroupUpdateDto): Promise<Group> {
		const group = await this.getGroupById(groupId);

		// ALlow removal of password by setting it to empty string / don't change if undefined or null
		if (update.password === "") {
			group.password = null;
		} else if (update.password) {
			group.password = update.password;
		}
		
		group.name = update.name ?? group.name;
		group.isClosed = update.isClosed ?? group.isClosed;
		
		return this.save(group);
	}

	async removeUser(groupId: GroupId, userId: UserId): Promise<boolean> {
		const removed = await this.manager.getRepository(UserGroupRelation).delete({ groupId, userId });
		return removed.affected == 1;
	}

	/**
	 * Deletes the group from the database.
	 */
	async deleteGroup(groupId: GroupId): Promise<boolean> {
		const deleteResult = await this.delete(groupId);
		return deleteResult.affected == 1;
	}

	private createEntityFromDto(courseId: CourseId, groupDto: GroupDto): Group {
		const group = new Group();
		group.courseId = courseId;
		group.name = groupDto.name;
		group.password = groupDto.password?.length > 0 ? groupDto.password : null;
		group.isClosed = groupDto.isClosed ? true : false;
		return group;
	}

}
