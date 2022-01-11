import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator";
import { GroupDto } from "../dto/group/group.dto";
import { GroupSettings } from "../entities/group-settings.entity";
import { GroupsForbiddenException } from "../exceptions/custom-exceptions";
import { Course } from "../models/course.model";
import { Participant } from "../models/participant.model";
import { GroupSettingsRepository } from "../repositories/group-settings.repository";
import { GroupService } from "../services/group.service";

export class JoinRandomGroupCommand implements ICommand {
	constructor(readonly course: Course, readonly participant: Participant) {}
}

@CommandHandler(JoinRandomGroupCommand)
export class JoinRandomGroupHandler implements ICommandHandler<JoinRandomGroupCommand> {
	constructor(
		private groupService: GroupService,
		private groupSettingRepository: GroupSettingsRepository
	) {}

	async execute(command: JoinRandomGroupCommand): Promise<GroupDto> {
		const { course, participant } = command;
		const groupSettings = await this.groupSettingRepository.getByCourseId(course.id);

		if (!groupSettings.allowGroups) {
			throw new GroupsForbiddenException(course.id);
		}

		const [groups] = await this.groupService.getGroupsOfCourse(course.id);
		const joinableGroup = this.tryGetJoinableGroup(groups, groupSettings);

		if (joinableGroup) {
			await this.groupService.addUserToGroup_Force(
				course.id,
				joinableGroup.id,
				participant.userId
			);

			return this.groupService.getGroup(joinableGroup.id);
		}

		return this.createNewGroup(course, participant);
	}

	private createNewGroup(course: Course, participant: Participant): Promise<GroupDto> {
		// Use randomName as fallback, if course does not enforce name schema.
		const randomName = uniqueNamesGenerator({
			dictionaries: [adjectives, colors, animals],
			style: "upperCase",
			separator: ""
		});

		return this.groupService.createGroup(course, participant, { name: randomName, id: null });
	}

	/**
	 * Tries to find a joinable group.
	 * Prioritizes the biggest group that is still below the required minimum group size.
	 * If such a group does not exists, chooses the smallest group with enough members.
	 * If there are no joinable groups, returns `undefined`.
	 */
	private tryGetJoinableGroup(groups: GroupDto[], settings: GroupSettings): GroupDto | undefined {
		// Open groups sorted by size from smallest to biggest
		const initialCandidates = this.getOpenGroups(groups, settings).sort(
			(a, b) => a.members.length - b.members.length
		);
		const biggestGroupThatIsTooSmall = this.tryGetBiggestGroupThatIsTooSmall(
			initialCandidates,
			settings
		);

		if (biggestGroupThatIsTooSmall) {
			return biggestGroupThatIsTooSmall;
		}

		const smallestGroupWithEnoughMembers = this.tryGetSmallestGroupThatHasEnoughMembers(
			initialCandidates,
			settings
		);

		if (smallestGroupWithEnoughMembers) {
			return smallestGroupWithEnoughMembers;
		}

		return undefined;
	}

	/**
	 * Filters all groups that have at least one available spot and
	 * are not protected by a password or closed.
	 */
	private getOpenGroups(groups: GroupDto[], settings: GroupSettings): GroupDto[] {
		return groups.filter(
			group => this.isOpen(group) && group.members.length < settings.sizeMax
		);
	}

	/**
	 * Returns the biggest group that is below the required minimum group size.
	 * Returns `undefined`, if no such group exists.
	 * Expects `groups` to be ordered by member size in ascending order.
	 */
	private tryGetBiggestGroupThatIsTooSmall(
		groups: GroupDto[],
		settings: GroupSettings
	): GroupDto | undefined {
		const groupsUnderMinimum = groups.filter(group => group.members.length < settings.sizeMin);

		return groupsUnderMinimum.length > 0
			? groupsUnderMinimum[groupsUnderMinimum.length - 1]
			: undefined;
	}

	/**
	 * Returns the smallest group that has more member than the required minimum group size.
	 * Expects
	 */
	private tryGetSmallestGroupThatHasEnoughMembers(
		groups: GroupDto[],
		settings: GroupSettings
	): GroupDto | undefined {
		const enoughMembers = groups.filter(group => group.members.length >= settings.sizeMin);
		return enoughMembers.length > 0 ? enoughMembers[0] : undefined;
	}

	private isOpen(group: GroupDto): boolean {
		return !group.hasPassword && !group.isClosed;
	}
}
