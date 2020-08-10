import { EntityRepository, Repository } from "typeorm";
import { AssignmentGroupRegistration } from "../entities/assignment-group-registration.entity";
import { GroupId, Group } from "../entities/group.entity";
import { UserId } from "../../shared/entities/user.entity";
import { AssignmentId } from "../entities/assignment.entity";
import { UserGroupRelation } from "../entities/user-group-relation.entity";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";

@EntityRepository(AssignmentGroupRegistration)
export class AssignmentGroupRegistrationRepository extends Repository<AssignmentGroupRegistration> {

	/**
	 * Creates a registration for the specified user.
	 * @throws `Error`, if user is already registered. 
	 */
	createRegistration(assignmentId: AssignmentId, groupId: GroupId, userId: UserId, participantId: number): Promise<AssignmentGroupRegistration> {
		const registration = new AssignmentGroupRegistration({
			assignmentId,
			groupId,
			userId,
			participantId
		});

		return this.save(registration);
	}

	/**
	 * Creates registrations for all users in the given groups.
	 */
	createRegistrations(assignmentId: AssignmentId, groups: Group[]): Promise<AssignmentGroupRegistration[]> {
		const registrations = this.buildRegistrations(groups, assignmentId);
		return this.save(registrations);
	}

	/**
	 * Maps groups with members to `AssignmentGroupRegistration` entities for a specific assignment.
	 * Groups must include `UserGroupRelation`.
	 */
	private buildRegistrations(groups: Group[], assignmentId: string): AssignmentGroupRegistration[] {
		const registrations: AssignmentGroupRegistration[] = [];
		groups.forEach(group => {
			group.userGroupRelations.forEach(member => {
				registrations.push(new AssignmentGroupRegistration({
					assignmentId,
					groupId: group.id,
					userId: member.userId,
					participantId: member.participantId
				}));
			});
		});
		return registrations;
	}

	/**
	 * Returns all registered groups with their members for a particular assignment.
	 * Includes relations:
	 * - Group (with members)
	 */
	async getRegisteredGroupsWithMembers(assignmentId: AssignmentId): Promise<Group[]> {
		const groupQuery = this.createQueryBuilder("registration")
			.where("registration.assignmentId = :assignmentId", { assignmentId })
			.innerJoinAndSelect("registration.group", "group")
			.groupBy("registration.groupId")
			.orderBy("group.name")
			.distinct(true);
		
		const registrationsGroups = await groupQuery.getMany();
		console.log(groupQuery);

		const participantQuery = this.createQueryBuilder("registration")
			.where("registration.assignmentId = :assignmentId", { assignmentId })
			.innerJoinAndSelect("registration.participant", "participant")
			.innerJoinAndSelect("participant", "participant.user")
			.groupBy("registration.groupId");

		const registrationsParticipants = await participantQuery.getMany();
		console.log(registrationsParticipants);

		// Map groupIds to groups
		const groupMap = new Map<GroupId, Group>();
		registrationsGroups.forEach(r => groupMap.set(r.groupId, r.group));

		// Add participants to groups
		registrationsParticipants.forEach(r => {
			const group = groupMap.get(r.groupId);
			group.userGroupRelations = group.userGroupRelations ?? [];
			group.userGroupRelations.push(new UserGroupRelation({
				participant: r.participant // Required to build Dto
			}));
		});

		const groups = Object.values(groupMap) as Group[];
		console.log(groups);
		return groups;
	}

	/**
	 * Returns the registered group with its members for a particular assignment.
	 * Includes relations:
	 * - Group (with members)
	 */
	async getRegisteredGroupWithMembers(assignmentId: AssignmentId, groupId: GroupId): Promise<Group> {
		const query = await this.createQueryBuilder("registration")
			.where("registration.assignmentId = :assignmentId", { assignmentId })
			.innerJoinAndSelect("registration.group", "group", "group.id = :groupId", { groupId })
			.innerJoinAndSelect("registration.participant", "participant")
			.innerJoinAndSelect("participant.user", "user")
			.getMany();
		
		const userGroupRelations: UserGroupRelation[] = [];
		query.forEach(registration => {
			userGroupRelations.push(new UserGroupRelation({
				participant: registration.participant
			}));
		});

		const group = query[0].group;
		group.userGroupRelations = userGroupRelations;
		return group;
	}

	/**
	 * Returns the user's group for a particular assignment.
	 * Includes relations:
	 * - Group (with members)
	 */
	async getRegisteredGroupOfUser(assignmentId: AssignmentId, userId: UserId): Promise<Group> {
		const query = await this.createQueryBuilder("registration")
			.where("registration.assignmentId = :assignmentId", { assignmentId })
			.innerJoin("registration.group", "group")
			.innerJoinAndSelect("registration.participant", "participant", "participant.userId = :userId", { userId })
			.innerJoinAndSelect("participant.user", "user")
			.getOne();
		
		if (!query) throw new EntityNotFoundError(Group, null);

		return this.getRegisteredGroupWithMembers(assignmentId, query.groupId);
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
		const registration = await this.findOneOrFail({
			where: {
				assignmentId,
				userId
			}
		});

		return !!(await this.remove(registration));
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
