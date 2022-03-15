import { Course } from "../../../src/course/entities/course.entity";
import { GroupSettings } from "../../../src/course/entities/group-settings.entity";
import { Group as GroupEntity } from "../../../src/course/entities/group.entity";
import { Participant as ParticipantEntity } from "../../../src/course/entities/participant.entity";
import { CourseWithGroupSettings } from "../../../src/course/models/course-with-group-settings.model";
import { Group } from "../../../src/course/models/group.model";
import { Participant } from "../../../src/course/models/participant.model";
import { GroupMergeStrategy } from "../../../src/course/services/group-merge.strategy";
import {
	MergeByActivityStrategy,
	isSameWeek,
	getWeekOfYear,
	countUniqueWeeks,
	countSubmittedAssignment,
	sortStudentsByActivity
} from "../../../src/course/services/merge-by-activity.strategy";
import { User } from "../../../src/shared/entities/user.entity";

import * as dayjs from "dayjs";
import { SubmissionDto } from "../../../src/submission/submission.dto";
import { ParticipantDto } from "../../../src/course/dto/course-participant/participant.dto";

xdescribe("GroupMergeStrategy", () => {
	describe("Min: 2, Max: 2", () => {
		const course = new CourseWithGroupSettings(
			new Course(),
			new GroupSettings({
				sizeMin: 2,
				sizeMax: 2
			})
		);

		it("Empty group list -> []", async () => {
			const result = new GroupMergeStrategy().merge([], course);
			expect(result).toEqual([]);
		});

		it("All groups valid -> Unchanged groups", () => {
			const groups = [
				createFakeGroup("Group 1", ["Member 1", "Member 2"]),
				createFakeGroup("Group 2", ["Member 3", "Member 4"])
			];

			const result = new GroupMergeStrategy().merge(groups, course);

			expect(result).toEqual(groups);
		});

		it("Merges two single students", () => {
			const groups = [
				createFakeGroup("Group 1", ["Member A"]),
				createFakeGroup("Group 2", ["Member X", "Member Y"]),
				createFakeGroup("Group 3", ["Member B"])
			];

			const result = new GroupMergeStrategy().merge(groups, course);

			expect(result).toHaveLength(2);
			expect(result[0].name).toEqual("Group 1");
			expect(result[0].members).toHaveLength(2);
			expect(result[0].members[0].username).toEqual("Member A");
			expect(result[0].members[1].username).toEqual("Member B");
		});

		it("Merges multiple single students", () => {
			const groups = [
				createFakeGroup("Group 1", ["Member A"]),
				createFakeGroup("Group Full 1", ["Member X", "Member Y"]),
				createFakeGroup("Group 2", ["Member B"]),
				createFakeGroup("Group Full 2", ["Member K", "Member C"]),
				createFakeGroup("Group 3", ["Member C"])
			];

			const result = new GroupMergeStrategy().merge(groups, course);

			expect(result).toHaveLength(4);

			expect(result[0].name).toEqual("Group 1");
			expect(result[0].members).toHaveLength(2);
			expect(result[0].members[0].username).toEqual("Member A");
			expect(result[0].members[1].username).toEqual("Member B");

			// Allow invalid group for remaining student
			expect(result[1].name).toEqual("Group 2");
			expect(result[1].members).toHaveLength(1);
			expect(result[1].members[0].username).toEqual("Member C");
		});
	});

	describe("Min: 2, Max: 3", () => {
		const course = new CourseWithGroupSettings(
			new Course(),
			new GroupSettings({
				sizeMin: 2,
				sizeMax: 3
			})
		);

		it("Merges multiple groups into one valid group", () => {
			const groups = [
				createFakeGroup("Group 1", ["A"]),
				createFakeGroup("Group 2", ["B"]),
				createFakeGroup("Group 3", ["C"])
			];

			const result = new GroupMergeStrategy().merge(groups, course);

			expect(result).toHaveLength(1);
			expect(result[0].name).toEqual("Group 1");
			expect(result[0].members).toHaveLength(3);
		});

		it("Group has capacity -> Adds single student", () => {
			const groups = [
				createFakeGroup("Group 1", ["A", "B"]),
				createFakeGroup("Group 2", ["C"])
			];

			const result = new GroupMergeStrategy().merge(groups, course);

			expect(result).toHaveLength(1);
			expect(result[0].name).toEqual("Group 1");
			expect(result[0].members).toHaveLength(3);
		});

		xit("4 Singles -> Creates two groups with 2 students", () => {
			const groups = [
				createFakeGroup("Group 1", ["A"]),
				createFakeGroup("Group 2", ["B"]),
				createFakeGroup("Group 3", ["C"]),
				createFakeGroup("Group 4", ["D"])
			];

			const result = new GroupMergeStrategy().merge(groups, course);

			expect(result).toHaveLength(2);
			expect(result[0].name).toEqual("Group 1");
			expect(result[0].members).toHaveLength(2);
		});
	});

	describe("Min: 3, Max: 5", () => {
		const course = new CourseWithGroupSettings(
			new Course(),
			new GroupSettings({
				sizeMin: 3,
				sizeMax: 5
			})
		);

		it("Merges multiple groups into one valid group", () => {
			const groups = [
				createFakeGroup("Group 1", ["A", "B"]),
				createFakeGroup("Group 2", ["C", "D"]),
				createFakeGroup("Group 3", ["E"])
			];

			const result = new GroupMergeStrategy().merge(groups, course);

			expect(result).toHaveLength(1);
			expect(result[0].name).toEqual("Group 3");
			expect(result[0].members).toHaveLength(5);
		});

		// TODO: Fails
		xit("6 Singles -> Creates two groups with 3 students", () => {
			const groups = [
				createFakeGroup("Group 1", ["A"]),
				createFakeGroup("Group 2", ["B"]),
				createFakeGroup("Group 3", ["C"]),
				createFakeGroup("Group 4", ["D"]),
				createFakeGroup("Group 5", ["E"]),
				createFakeGroup("Group 6", ["F"])
			];

			const result = new GroupMergeStrategy().merge(groups, course);

			result.forEach(r => console.log(`${r.name}: ${r.members.map(m => m.username)}`));

			expect(result).toHaveLength(2);
			expect(result[0].members).toHaveLength(3);
			expect(result[1].members).toHaveLength(3);
		});
	});
});

describe("MergeByActivityStrategy", () => {
	//let mergeByActivityStrategy: MergeByActivityStrategy;

	it("merge", async () => {
		const isSame = isSameWeek(new Date(2022, 1, 3), new Date(2022, 1, 5));
		expect(isSame).toEqual(true);
	});

	test.each([
		[new Date(2022, 0, 1), 1],
		[new Date(2022, 0, 2), 2],
		[new Date(2022, 0, 9), 3],
		[new Date(2022, 0, 16), 4],
		[new Date(2022, 11, 31), 53],
		[new Date(2018, 5, 27), 26],
		[new Date(2018, 5, 20), 25]
	])("%s - Week: %s", (date, expected) => {
		expect(getWeekOfYear(date)).toEqual(expected);
	});
});

function createFakeGroup(name: string, members: string[]) {
	const fullGroup = new Group({
		name,
		userGroupRelations: []
	} as GroupEntity);

	fullGroup.members = members.map(
		m => new Participant({ user: { username: m } as User } as ParticipantEntity)
	);

	return fullGroup;
}

describe("countUniqueWeeks", () => {
	it("0 Dates -> 0 Unique weeks", () => {
		expect(countUniqueWeeks([])).toEqual(0);
	});

	it("1 Date -> 1 Unique week", () => {
		expect(countUniqueWeeks([new Date(2022, 1, 1)])).toEqual(1);
	});

	it("2 Dates in same week -> 1 Unique week", () => {
		expect(countUniqueWeeks([new Date(2022, 1, 1), new Date(2022, 1, 2)])).toEqual(1);
	});

	it("2 Dates in different weeks -> 2 Unique weeks", () => {
		expect(countUniqueWeeks([new Date(2022, 1, 1), new Date(2022, 1, 22)])).toEqual(2);
	});

	it("5 Dates in different 3 weeks -> 3 Unique weeks", () => {
		expect(
			countUniqueWeeks([
				new Date(2022, 1, 1),
				new Date(2022, 1, 2),
				new Date(2022, 1, 11),
				new Date(2022, 1, 12),
				new Date(2022, 1, 30)
			])
		).toEqual(3);
	});
});

describe("countSubmittedAssignments", () => {
	const submission = (assignmentId: string, userId: string): SubmissionDto => {
		return { assignmentId, userId } as SubmissionDto;
	};

	it("Counts number of submitted assignments by user", () => {
		const userIds = ["max", "moritz", "harry", "ronald"];

		const submissions: SubmissionDto[] = [
			submission("homework-01", "max"),
			submission("homework-01", "max"),
			submission("homework-01", "moritz"),
			submission("testat-01", "max"),
			submission("testat-01", "moritz"),
			submission("homework-01", "harry")
		];

		const countMap = countSubmittedAssignment(submissions, userIds);

		expect(countMap.get("max")).toEqual(2); // Multiple submissions for same assignment are counted as 1
		expect(countMap.get("moritz")).toEqual(2);
		expect(countMap.get("harry")).toEqual(1);
		expect(countMap.get("ronald")).toEqual(0);
	});
});

describe("sortStudentsByActivity", () => {
	const student = (name: string): ParticipantDto => {
		return { userId: name } as ParticipantDto;
	};

	it("Prefers higher submission count", () => {
		const studentsInInvalidGroups: ParticipantDto[] = [
			student("max"),
			student("moritz"),
			student("harry"),
			student("ronald")
		];

		const submittedAssignmentsByStudent = new Map([
			["max", 0], // 4
			["moritz", 10], // 1
			["harry", 1], // 3
			["ronald", 5] // 2
		]);

		const activeWeekCountByStudent = new Map([
			["max", 10],
			["moritz", 0],
			["harry", 5],
			["ronald", 2]
		]);

		const rankedStudents = sortStudentsByActivity(
			studentsInInvalidGroups,
			submittedAssignmentsByStudent,
			activeWeekCountByStudent
		);

		expect(rankedStudents).toEqual([
			{ userId: "moritz" },
			{ userId: "ronald" },
			{ userId: "harry" },
			{ userId: "max" }
		]);
	});

	it("Equal submission count -> ranks by activity", () => {
		const studentsInInvalidGroups: ParticipantDto[] = [
			student("max"),
			student("moritz"),
			student("harry")
		];

		const submittedAssignmentsByStudent = new Map([
			["max", 10],
			["moritz", 10],
			["moritz", 10]
		]);

		const activeWeekCountByStudent = new Map([
			["max", 5], // 2
			["moritz", 10], // 1
			["harry", 2] // 3
		]);

		const rankedStudents = sortStudentsByActivity(
			studentsInInvalidGroups,
			submittedAssignmentsByStudent,
			activeWeekCountByStudent
		);

		expect(rankedStudents).toEqual([
			{ userId: "moritz" },
			{ userId: "max" },
			{ userId: "harry" }
		]);
	});
});
