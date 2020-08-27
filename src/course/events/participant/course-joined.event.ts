import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { GroupDto } from "../../dto/group/group.dto";
import { CourseWithGroupSettings } from "../../models/course-with-group-settings.model";
import { Participant } from "../../models/participant.model";
import { GroupService } from "../../services/group.service";
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";

export class CourseJoined {
	constructor(
		readonly course: CourseWithGroupSettings, 
		readonly participant: Participant
	) { }
}

@EventsHandler(CourseJoined)
export class CourseJoinedHandler implements IEventHandler<CourseJoined> {

	constructor(private groupService: GroupService) { }

	async handle(event: CourseJoined): Promise<void> {
		const { course, participant } = event;

		if (course.wantsAutomaticGroupJoins() && course.groupSettings.allowGroups) {
			const [groups] = await this.groupService.getGroupsOfCourse(course.id);
			
			const joinableGroup = this.tryGetJoinableGroup(groups, course);

			if (joinableGroup) {
				await this.groupService.addUserToGroup_Force(course.id, joinableGroup.id, participant.userId);
			} else {
				this.createNewGroup(course, participant);
			}
		}
	}

	private createNewGroup(course: CourseWithGroupSettings, participant: Participant) {
		// Use randomName as fallback, if course does not enforce name schema.
		const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
		this.groupService.createGroup(course, participant, { name: randomName });
	}

	/**
	 * Tries to find a joinable group.
	 * Prioritizes the biggest group that is still below the required minimum group size.
	 * If such a group does not exists, chooses the smallest group with enough members.
	 * If there are no joinable groups, returns `undefined`.
	 */
	private tryGetJoinableGroup(groups: GroupDto[], course: CourseWithGroupSettings): GroupDto | undefined {
		// Open groups sorted by size from smallest to biggest
		const initialCandidates = this.getOpenGroups(groups, course).sort((a, b) => a.members.length - b.members.length);
		const biggestGroupThatIsTooSmall = this.tryGetBiggestGroupThatIsTooSmall(initialCandidates, course);

		if (biggestGroupThatIsTooSmall) {
			return biggestGroupThatIsTooSmall;
		}

		const smallestGroupWithEnoughMembers = this.tryGetSmallestGroupThatHasEnoughMembers(initialCandidates, course);

		if (smallestGroupWithEnoughMembers) {
			return smallestGroupWithEnoughMembers;
		}

		return undefined;
	}

	/**
	 * Filters all groups that have at least one available spot and 
	 * are not protected by a password or closed.
	 */
	private getOpenGroups(groups: GroupDto[], course: CourseWithGroupSettings): GroupDto[] {
		return groups.filter(group => this.isOpen(group) && group.members.length < course.getMaxGroupSize());
	}

	/**
	 * Returns the biggest group that is below the required minimum group size.
	 * Returns `undefined`, if no such group exists.
	 * Expects `groups` to be ordered by member size in ascending order.
	 */
	private tryGetBiggestGroupThatIsTooSmall(groups: GroupDto[], course: CourseWithGroupSettings): GroupDto | undefined {
		const groupsUnderMinimum = groups
			.filter(group => group.members.length < course.getMinGroupSize());

		//console.log(groupsUnderMinimum);
		
		return groupsUnderMinimum.length > 0 ? groupsUnderMinimum[groupsUnderMinimum.length - 1] : undefined;
	}

	/**
	 * Returns the smallest group that has more member than the required minimum group size.
	 * Expects 
	 */
	private tryGetSmallestGroupThatHasEnoughMembers(groups: GroupDto[], course: CourseWithGroupSettings): GroupDto | undefined {
		const enoughMembers = groups.filter(group => group.members.length >= course.getMinGroupSize());
		return enoughMembers.length > 0 ? enoughMembers[0] : undefined; 
	}

	private isOpen(group: GroupDto): boolean {
		return !group._hasPassword && !group.isClosed;
	}

}
