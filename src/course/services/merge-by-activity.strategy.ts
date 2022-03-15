import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ActivityService } from "../../activity/activity.service";
import { SubmissionService } from "../../submission/submission.service";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { GroupDto } from "../dto/group/group.dto";
import { ParticipantRepository } from "../repositories/participant.repository";
import * as dayjs from "dayjs";
import * as weekOfYear from "dayjs/plugin/weekOfYear";
import { SubmissionDto } from "../../submission/submission.dto";
import { ActivityDto } from "../../activity/activity.dto";

dayjs.extend(weekOfYear);

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
		groups: { name: string; members: ParticipantDto[] }[]
	): Promise<GroupDto[]> {
		const invalidGroups = groups.filter(
			g => g.members.length >= 0 && g.members.length < minSize
		);

		const studentsInInvalidGroups = invalidGroups.flatMap(g => g.members);
		const studentsInInvalidGroupsUserIds = studentsInInvalidGroups.map(p => p.userId);

		const [activity, [submissions]] = await Promise.all([
			this.activityService.getActivityData(courseId),
			this.submissions.getAllSubmissions(courseId)
		]);

		const activityOfStudentsFromInvalidGroups = activity.filter(a =>
			studentsInInvalidGroupsUserIds.includes(a.user.userId)
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

		return [];
	}
}

export function calculateIdealGroupSizes(
	numberOfStudents: number,
	minSize: number,
	maxSize: number
): number[] {
	let idealGroupSize = -1;

	for (let size = maxSize; size >= minSize; size--) {
		const remaining = numberOfStudents % size;

		if (remaining == 0 || remaining >= minSize) {
			idealGroupSize = size;
			// TODO
		}
	}

	return [];
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
	userIds: string[]
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
