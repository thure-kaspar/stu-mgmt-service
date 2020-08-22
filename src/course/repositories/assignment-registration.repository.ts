import { EntityRepository, getRepository, Repository } from "typeorm";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { DtoFactory } from "../../shared/dto-factory";
import { UserId } from "../../shared/entities/user.entity";
import { AssignmentGroupTuple } from "../../user/dto/assignment-group-tuple.dto";
import { AssignmentRegistrationFilter } from "../dto/assignment/assignment-registration.filter";
import { GroupDto } from "../dto/group/group.dto";
import { AssignmentRegistration } from "../entities/assignment-group-registration.entity";
import { AssignmentId } from "../entities/assignment.entity";
import { CourseId } from "../entities/course.entity";
import { GroupRegistrationRelation } from "../entities/group-registration-relation.entity";
import { Group, GroupId } from "../entities/group.entity";

@EntityRepository(AssignmentRegistration)
export class AssignmentRegistrationRepository extends Repository<AssignmentRegistration> {

	private readonly groupRelationsRepository = getRepository(GroupRegistrationRelation);

	/**
	 * Creates a registration for the specified user.
	 * @throws `Error`, if user is already registered. 
	 */
	async createRegistration(assignmentId: AssignmentId, groupId: GroupId, userId: UserId, participantId: number): Promise<AssignmentRegistration> {
		// Check if group is already registered
		const groupRegistration = await this.tryGetRegistration(assignmentId, groupId);
		
		// If not - create registration for group
		if (!groupRegistration) {
			const registration = new AssignmentRegistration({
				assignmentId,
				groupId,
				groupRelations: [new GroupRegistrationRelation({ participantId })]
			});

			return this.save(registration);
		} 
		
		await this.groupRelationsRepository.insert({ 
			assignmentRegistrationId: groupRegistration.id,
			participantId: participantId 
		});

		return this.findOne(groupRegistration.id, { 
			relations: ["groupRelations", "groupRelations.participant", "groupRelations.participant.user"]
		});
	}

	private async tryGetRegistration(assignmentId: AssignmentId, groupId: GroupId): Promise<AssignmentRegistration> {
		return this.findOne({ where: { assignmentId, groupId }});
	}

	/**
	 * Creates registrations for all users in the given groups.
	 */
	createRegistrations(assignmentId: AssignmentId, groups: Group[]): Promise<AssignmentRegistration[]> {
		const registrations = this.buildRegistrations(groups, assignmentId);
		if (registrations.length == 0) return [] as any;
		return this.save(registrations);
	}

	/**
	 * Maps groups with members to `AssignmentGroupRegistration` entities for a specific assignment.
	 * Groups must include `UserGroupRelation`.
	 */
	private buildRegistrations(groups: Group[], assignmentId: string): AssignmentRegistration[] {
		const registrations = groups.map(group => {
			const registration = new AssignmentRegistration({
				assignmentId,
				groupId: group.id,
			});
			
			registration.groupRelations = group.userGroupRelations.map(member => new GroupRegistrationRelation({ 
				participantId: member.participantId
			}));

			return registration;
		});
		return registrations;
	}

	/**
	 * Returns all registered groups with their members for a particular assignment.
	 * Includes relations:
	 * - Group (with members)
	 */
	async getRegisteredGroupsWithMembers(assignmentId: AssignmentId, filter?: AssignmentRegistrationFilter): Promise<[GroupDto[], number]> {
		const { groupname, skip, take } = filter || { };

		const query = this.createQueryBuilder("registration")
			.where("registration.assignmentId = :assignmentId", { assignmentId })
			.innerJoinAndSelect("registration.group", "group")
			.leftJoinAndSelect("registration.groupRelations", "groupRelations")
			.leftJoinAndSelect("groupRelations.participant", "participant")
			.leftJoinAndSelect("participant.user", "user")
			.orderBy("group.name", "ASC")
			.skip(skip)
			.take(take);
	
		if (groupname) {
			query.andWhere("group.name ILIKE :groupname", { groupname: `%${groupname}%` });
		}

		const [result, count] = await query.getManyAndCount();
		
		const groups: GroupDto[] = result.map(r => {
			const group = DtoFactory.createGroupDto(r.group);
			group.members = r.groupRelations.map(relation => relation.participant.toDto());
			return group;
		});

		return [groups, count];
	}

	/**
	 * Returns the registered group with its members for a particular assignment.
	 * Includes relations:
	 * - Group (with members)
	 */
	async getRegisteredGroupWithMembers(assignmentId: AssignmentId, groupId: GroupId): Promise<GroupDto> {
		const query = await this.createQueryBuilder("registration")
			.where("registration.assignmentId = :assignmentId", { assignmentId })
			.andWhere("registration.groupId = :groupId", { groupId })
			.innerJoinAndSelect("registration.group", "group")
			.leftJoinAndSelect("registration.groupRelations", "groupRelations")
			.leftJoinAndSelect("groupRelations.participant", "participant")
			.leftJoinAndSelect("participant.user", "user")
			.getOne();

		if (!query) throw new EntityNotFoundError(AssignmentRegistration, null);
		
		const group = DtoFactory.createGroupDto(query.group);
		group.members = query.groupRelations.map(relation => relation.participant.toDto());
		return group;
	}

	/**
	 * Returns the user's group for a particular assignment.
	 * Includes relations:
	 * - Group (with members)
	 * @throws EntityNotFoundError if user has no registered group
	 */
	async getRegisteredGroupOfUser(assignmentId: AssignmentId, userId: UserId): Promise<GroupDto> {
		const group = await this.tryGetRegisteredGroupOfUser(assignmentId, userId);
		if (!group) throw new EntityNotFoundError(AssignmentRegistration, null);
		return group;
	}

	/**
	 * Returns the user's group for a particular assignment or `undefined` if it does not exist.
	 * Includes relations:
	 * - Group (with members)
	 */
	async tryGetRegisteredGroupOfUser(assignmentId: AssignmentId, userId: UserId): Promise<GroupDto> {
		const query = await this.createQueryBuilder("registration")
			.where("registration.assignmentId = :assignmentId", { assignmentId })
			.andWhere("participant.userId = :userId", { userId })
			.innerJoinAndSelect("registration.group", "group")
			.leftJoinAndSelect("registration.groupRelations", "groupRelations")
			.innerJoinAndSelect("groupRelations.participant", "participant")
			.getOne();

		if (!query) return undefined;
		
		return this.getRegisteredGroupWithMembers(assignmentId, query.groupId); // TODO: Do in this query instead of 2
	}

	async getAllRegisteredGroupsOfUserInCourse(courseId: CourseId, userId: UserId): Promise<AssignmentGroupTuple[]> {
		const query = await this.createQueryBuilder("registration")
			.where("participant.userId = :userId", { userId })
			.innerJoinAndSelect("registration.group", "group")
			.innerJoinAndSelect("registration.assignment", "assignment")
			.innerJoin("registration.groupRelations", "groupRelations")
			.innerJoin("groupRelations.participant", "participant")
			.orderBy("assignment.endDate", "ASC", "NULLS LAST")
			.getMany();
		
		const tuples: AssignmentGroupTuple[] = query.map(registration => {
			const group = DtoFactory.createGroupDto(registration.group);
			return {
				assignment: DtoFactory.createAssignmentDto(registration.assignment),
				group: group
			};
		});

		return tuples;
	}

	/**
	 * Returns `true`, if any there exist any `AssignmentGroupRegistration` for this assignment.
	 */
	async hasRegistrations(assignmentId: AssignmentId): Promise<boolean> {
		const exists = await this.findOne({ where: { assignmentId }});
		return !!exists;
	}

	/**
	 * Removes the registration of a user.
	 */
	async removeRegistrationForUser(assignmentId: AssignmentId, userId: UserId): Promise<boolean> {
		const relation = await this.groupRelationsRepository.createQueryBuilder("relation")
			.innerJoin("relation.assignmentRegistration", "registration", "registration.assignmentId = :assignmentId", { assignmentId })
			.innerJoin("relation.participant", "participant", "participant.userId = :userId", { userId })
			.getOne();

		if (!relation) throw new EntityNotFoundError(GroupRegistrationRelation, { assignmentId, userId });
		return !!(await this.groupRelationsRepository.remove(relation));
	}

	/**
	 * Removes the registration of a group and thereby removes the registrations of all members.
	 */
	async removeRegistrationForGroup(assignmentId: AssignmentId, groupId: GroupId): Promise<boolean> {
		const registrations = await this.find({
			where: {
				assignmentId,
				groupId
			}
		});

		if (registrations.length == 0) return false;

		return !!(await this.remove(registrations));
	}

	/**
	 * Removes all registrations for this assignment.
	 */
	async removeRegistrations(assignmentId: AssignmentId): Promise<void> {
		await this.delete({ assignmentId });
	}

}
