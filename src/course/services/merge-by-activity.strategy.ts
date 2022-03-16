import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as dayjs from "dayjs";
import * as weekOfYear from "dayjs/plugin/weekOfYear";
import { ActivityDto } from "../../activity/activity.dto";
import { ActivityService } from "../../activity/activity.service";
import { SubmissionDto } from "../../submission/submission.dto";
import { SubmissionService } from "../../submission/submission.service";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { ParticipantRepository } from "../repositories/participant.repository";

dayjs.extend(weekOfYear);

type GroupType = { id: string; members: ParticipantDto[] };

@Injectable()
export class MergeByActivityStrategy {
	constructor(
		@InjectRepository(ParticipantRepository)
		private participantsRepository: ParticipantRepository,
		private activityService: ActivityService,
		private submissions: SubmissionService
	) {}

	async merge(
		courseId: string,
		minSize: number,
		maxSize: number,
		groups: GroupType[]
	): Promise<GroupType[]> {
		const { invalidGroups, validGroups } = splitGroupsByValidity(groups, minSize);

		// If merges are not necessary
		if (invalidGroups.length == 0) {
			return validGroups;
		}

		const studentsInInvalidGroups = invalidGroups.flatMap(g => g.members);
		const studentsInInvalidGroupsUserIds = new Set(studentsInInvalidGroups.map(p => p.userId));

		const [activity, [submissions]] = await Promise.all([
			this.activityService.getActivityData(courseId),
			this.submissions.getAllSubmissions(courseId)
		]);

		const activityOfStudentsFromInvalidGroups = activity.filter(a =>
			studentsInInvalidGroupsUserIds.has(a.user.userId)
		);

		const activeWeekCountByStudent = countActiveWeeks(activityOfStudentsFromInvalidGroups);

		const submittedAssignmentsByStudent = countSubmittedAssignment(
			submissions,
			studentsInInvalidGroupsUserIds
		);

		const rankedStudents = sortStudentsByActivity(
			studentsInInvalidGroups,
			submittedAssignmentsByStudent,
			activeWeekCountByStudent
		);

		const idealGroupSizes = calculateIdealGroupSizes(rankedStudents.length, minSize, maxSize);

		if (idealGroupSizes.length == 0) {
			return [...validGroups, ...invalidGroups];
		}

		const mergedGroups = mergeInvalidGroups(idealGroupSizes, rankedStudents);

		return [...validGroups, ...mergedGroups];
	}
}

/**
 * Merges groups by placing the given `rankedStudents` into groups according the specified `idealGroupSizes`.
 * Uses the existing groups (see example below).
 *
 * **Example**:
 *
 * **Input**:
 * - `idealGroupSizes`: [3, 2]
 * - `rankedStudents`: [A, B, C, D, E]
 * **Result**:
 *
 * 	- Group of A: [A, B, C]
 * 	- Group of D: [D, E]
 */
export function mergeInvalidGroups(
	idealGroupSizes: number[],
	rankedStudents: ParticipantDto[]
): GroupType[] {
	const groupIds = rankedStudents.map(s => s.groupId);
	const availableIds = new Set<string>(groupIds);

	const REQUIRES_ID = "REQUIRES-ID";

	const mergedGroups: GroupType[] = [];
	let firstMemberIndex = 0;

	for (const groupSize of idealGroupSizes) {
		const lastMemberIndex = firstMemberIndex + groupSize - 1;

		const group: GroupType = {
			id: REQUIRES_ID,
			members: []
		};

		// Find available group name
		for (let i = firstMemberIndex; i <= lastMemberIndex; i++) {
			const student = rankedStudents[i];

			if (availableIds.has(student.groupId)) {
				group.id = student.groupId;
				availableIds.delete(student.groupId);
				break;
			}
		}

		// Add members to group
		for (let i = firstMemberIndex; i <= lastMemberIndex; i++) {
			group.members.push(rankedStudents[i]);
		}

		firstMemberIndex += groupSize;
		mergedGroups.push(group);
	}

	const remainingGroupIds = Array.from(availableIds.values());
	const unnamedGroups = mergedGroups.filter(g => g.id === REQUIRES_ID);

	for (const group of unnamedGroups) {
		if (remainingGroupIds.length > 0) {
			group.id = remainingGroupIds.pop();
		} else {
			console.log("No groupId was available ... This should not happen");
		}
	}

	return mergedGroups;
}

export function splitGroupsByValidity(
	groups: GroupType[],
	minSize: number
): {
	validGroups: GroupType[];
	invalidGroups: GroupType[];
	emptyGroups: GroupType[];
} {
	const emptyGroups: GroupType[] = [];
	const validGroups: GroupType[] = [];
	const invalidGroups: GroupType[] = [];

	for (const g of groups) {
		if (g.members.length == 0) {
			emptyGroups.push(g);
		} else if (g.members.length < minSize) {
			invalidGroups.push(g);
		} else {
			validGroups.push(g);
		}
	}

	return { validGroups, invalidGroups, emptyGroups };
}

export function calculateIdealGroupSizes(
	numberOfStudents: number,
	minSize: number,
	maxSize: number
): number[] {
	if (numberOfStudents == 0) {
		return [];
	}

	if (numberOfStudents <= minSize) {
		return [numberOfStudents];
	}

	const possibleGroupSizes: number[] = [];
	for (let size = minSize; size <= maxSize; size++) {
		possibleGroupSizes.push(size);
	}

	const optCombination = bestSum(numberOfStudents, possibleGroupSizes);

	if (optCombination) {
		return optCombination;
	}

	const remaining = numberOfStudents % maxSize;

	const sizes: number[] = [];
	sizes.push(...Array(Math.ceil(numberOfStudents / maxSize) - 1).fill(maxSize));
	sizes.push(remaining);
	return sizes;
}

/**
 * Computes the minimal combination of `numbers` (sorted by descending order) to sum up to the given `targetSum`.
 * @returns `undefined`, if no valid combination exists.
 */
export function bestSum(targetSum: number, numbers: number[]): number[] | undefined {
	const table: number[][] = Array(targetSum + 1).fill(null);
	table[0] = [];

	for (let i = 0; i < targetSum; i++) {
		if (table[i] !== null) {
			for (const num of numbers) {
				const combinationLength = table[i].length + 1;

				if (!table[i + num] || combinationLength < table[i + num].length) {
					const combination = [...table[i], num];
					table[i + num] = combination;
				}
			}
		}
	}

	return table[targetSum]?.sort((a, b) => b - a); // Sort DESC
}

function countActiveWeeks(activity: ActivityDto[]) {
	const activeWeekCountByStudent = new Map<string, number>();
	for (const act of activity) {
		activeWeekCountByStudent.set(act.user.userId, countUniqueWeeks(act.dates));
	}
	return activeWeekCountByStudent;
}

export function sortStudentsByActivity(
	studentsInInvalidGroups: ParticipantDto[],
	submittedAssignmentsByStudent: Map<string, number>,
	activeWeekCountByStudent: Map<string, number>
): ParticipantDto[] {
	return studentsInInvalidGroups.sort((a, b) => {
		const submittedAssignmentsA = submittedAssignmentsByStudent.get(a.userId);
		const submittedAssignmentsB = submittedAssignmentsByStudent.get(b.userId);

		const activeWeeksA = activeWeekCountByStudent.get(a.userId);
		const activeWeeksB = activeWeekCountByStudent.get(b.userId);

		if (submittedAssignmentsA === submittedAssignmentsB) {
			return activeWeeksB - activeWeeksA;
		} else {
			return submittedAssignmentsB - submittedAssignmentsA;
		}
	});
}

export function getWeekOfYear(date: Date): number {
	return dayjs(date).week();
}

export function isSameWeek(d1: Date, d2: Date): boolean {
	return dayjs(d1).isSame(d2, "week");
}

export function countSubmittedAssignment(
	submissions: SubmissionDto[],
	userIds: Set<string>
): Map<string, number> {
	const relevantStudents = new Map<string, { [assignmentId: string]: boolean }>();
	userIds.forEach(id => {
		relevantStudents.set(id, {});
	});

	for (const submission of submissions) {
		const submittedAssignments = relevantStudents.get(submission.userId);

		if (submittedAssignments) {
			submittedAssignments[submission.assignmentId] = true;
		}
	}

	const countMap = new Map<string, number>();

	relevantStudents.forEach((submittedAssignment, userId) => {
		const count = Object.keys(submittedAssignment).length;
		countMap.set(userId, count);
	});

	return countMap;
}

export function countUniqueWeeks(dates: Date[]): number {
	if (dates.length <= 1) {
		return dates.length;
	}

	let count = 1;
	let current = 0;
	let next = 1;

	while (current < dates.length && next < dates.length) {
		if (isSameWeek(dates[current], dates[next])) {
			next++; // Move right index further to the right
		} else {
			count++;
			current = next; // Set left index to first date in new week
		}
	}

	return count;
}
