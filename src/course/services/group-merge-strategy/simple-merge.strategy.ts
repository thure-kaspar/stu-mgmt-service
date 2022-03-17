import { Group } from "../../models/group.model";
import { CourseWithGroupSettings } from "../../models/course-with-group-settings.model";

/**
 * Merges invalid groups or adds them to open groups according to the following rules:
 * 1. Merge invalid group with other invalid group, repeat until group is valid
 * 2. Remaining invalid groups: Try to find joinable group, prioritize merged groups instead of touching existing groups
 * 3. If no joinable group is found, group is allowed to stay invalid
 *
 * Groups won't be split up in this strategy!
 */
export class SimpleMergeStrategy {
	// TODO: Does not implement GroupMergeStrategy
	merge(groups: Group[], course: CourseWithGroupSettings): Group[] {
		const sizeMin = course.getMinGroupSize();
		const sizeMax = course.getMaxGroupSize();

		const sortedGroups = this.sortGroupsBySizeAsc(groups);
		const [invalidGroups, openGroups] = this.splitGroups(sortedGroups, sizeMin, sizeMax);

		const mergedGroups = this.tryMergeInvalidGroups(invalidGroups, groups, sizeMax);
		const newOpenGroups: Group[] = [];
		const remainingInvalidGroups: Group[] = [];

		mergedGroups.forEach(group => {
			if (group.size >= sizeMin && group.isJoinable(sizeMax)) {
				newOpenGroups.push(group);
			} else if (group.size < sizeMin) {
				remainingInvalidGroups.push(group);
			}
		});

		remainingInvalidGroups.forEach(group => {
			// Predicate that is true, if group is not empty and has enough capacity
			const hasCapacity = (g: Group): boolean => g.size > 0 && group.size + g.size <= sizeMax;
			// Search for joinable group, prioritize merged groups from before instead of touching actually existing groups
			const joinableGroup = newOpenGroups.find(hasCapacity) ?? openGroups.find(hasCapacity);

			if (joinableGroup) {
				this.mergeIntoFirstGroup(joinableGroup, group);
			}
		});

		groups = groups.filter(g => g.members.length > 0);
		return groups;
	}

	private tryMergeInvalidGroups(invalidGroups: Group[], groups: Group[], sizeMax: number) {
		let i = 1;
		while (i < invalidGroups.length) {
			const group = invalidGroups[i - 1];

			let currentGroupSize = group.size;
			let canBeMerged = true;

			while (canBeMerged && i < invalidGroups.length) {
				const mergedGroupSize = currentGroupSize + groups[i].size;

				if (mergedGroupSize > sizeMax) {
					canBeMerged = false;
				} else if (mergedGroupSize == sizeMax) {
					this.mergeIntoFirstGroup(group, groups[i]);
					canBeMerged = false;
				} else {
					currentGroupSize = mergedGroupSize;
					this.mergeIntoFirstGroup(group, groups[i]);
					i++;
				}
			}

			i++;
		}

		return invalidGroups.filter(g => g.size > 0);
	}

	private mergeIntoFirstGroup(first: Group, second: Group): void {
		first.members.push(...second.members);
		second.members = [];
	}

	/**
	 * Returns a tuple containing `[invalidGroups, openGroups, fullGroups]`.
	 * @param sortedGroups Groups sorted by size in ascending order
	 */
	private splitGroups(
		sortedGroups: Group[],
		sizeMin: number,
		sizeMax: number
	): [Group[], Group[]] {
		const invalidGroups: Group[] = [];
		const openGroups: Group[] = [];

		for (const group of sortedGroups) {
			if (group.size == 0) {
				continue; // Skip empty group
			}

			if (group.isTooSmall(sizeMin)) {
				invalidGroups.push(group);
			} else if (group.isJoinable(sizeMax)) {
				openGroups.push(group);
			} else {
				break;
			}
		}

		return [invalidGroups, openGroups];
	}

	private sortGroupsBySizeAsc(groups: Group[]) {
		return groups.sort((a, b) => a.size - b.size);
	}
}
