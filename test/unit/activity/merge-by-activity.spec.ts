import { ActivityService } from "../../../src/activity/activity.service";
import { ParticipantDto } from "../../../src/course/dto/course-participant/participant.dto";
import { Course } from "../../../src/course/entities/course.entity";
import { GroupSettings } from "../../../src/course/entities/group-settings.entity";
import { Group as GroupEntity } from "../../../src/course/entities/group.entity";
import { Participant as ParticipantEntity } from "../../../src/course/entities/participant.entity";
import { CourseWithGroupSettings } from "../../../src/course/models/course-with-group-settings.model";
import { Group } from "../../../src/course/models/group.model";
import { Participant } from "../../../src/course/models/participant.model";
import { SimpleGroup } from "../../../src/course/services/group-merge-strategy/group-merge.strategy";
import {
	bestSum,
	calculateIdealGroupSizes,
	countSubmittedAssignment,
	countUniqueWeeks,
	getWeekOfYear,
	isSameWeek,
	mergeByActivity,
	MergeByActivityStrategy,
	mergeInvalidGroups,
	sortStudentsByActivity,
	splitGroupsByValidity
} from "../../../src/course/services/group-merge-strategy/merge-by-activity.strategy";
import { SimpleMergeStrategy } from "../../../src/course/services/group-merge-strategy/simple-merge.strategy";
import { User } from "../../../src/shared/entities/user.entity";
import { SubmissionDto } from "../../../src/submission/submission.dto";
import { SubmissionService } from "../../../src/submission/submission.service";

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

const student = (name: string): ParticipantDto => {
	return { userId: name } as ParticipantDto;
};

const group = (groupName: string, memberNames: string[]): SimpleGroup => {
	return {
		id: groupName,
		members: memberNames.map(
			username =>
				({
					userId: username,
					username: username,
					groupId: groupName // IMPORTANT - Used to determine groupId of merged groups
				} as ParticipantDto)
		)
	};
};

const submission = (assignmentId: string, userId: string): SubmissionDto => {
	return { assignmentId, userId } as SubmissionDto;
};

describe("SimpleMergeStrategy", () => {
	describe("Min: 2, Max: 2", () => {
		const course = new CourseWithGroupSettings(
			new Course(),
			new GroupSettings({
				sizeMin: 2,
				sizeMax: 2
			})
		);

		it("Empty group list -> []", async () => {
			const result = new SimpleMergeStrategy().merge([], course);
			expect(result).toEqual([]);
		});

		it("All groups valid -> Unchanged groups", () => {
			const groups = [
				createFakeGroup("Group 1", ["Member 1", "Member 2"]),
				createFakeGroup("Group 2", ["Member 3", "Member 4"])
			];

			const result = new SimpleMergeStrategy().merge(groups, course);

			expect(result).toEqual(groups);
		});

		it("Merges two single students", () => {
			const groups = [
				createFakeGroup("Group 1", ["Member A"]),
				createFakeGroup("Group 2", ["Member X", "Member Y"]),
				createFakeGroup("Group 3", ["Member B"])
			];

			const result = new SimpleMergeStrategy().merge(groups, course);

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

			const result = new SimpleMergeStrategy().merge(groups, course);

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

			const result = new SimpleMergeStrategy().merge(groups, course);

			expect(result).toHaveLength(1);
			expect(result[0].name).toEqual("Group 1");
			expect(result[0].members).toHaveLength(3);
		});

		it("Group has capacity -> Adds single student", () => {
			const groups = [
				createFakeGroup("Group 1", ["A", "B"]),
				createFakeGroup("Group 2", ["C"])
			];

			const result = new SimpleMergeStrategy().merge(groups, course);

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

			const result = new SimpleMergeStrategy().merge(groups, course);

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

			const result = new SimpleMergeStrategy().merge(groups, course);

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

			const result = new SimpleMergeStrategy().merge(groups, course);

			result.forEach(r => console.log(`${r.name}: ${r.members.map(m => m.username)}`));

			expect(result).toHaveLength(2);
			expect(result[0].members).toHaveLength(3);
			expect(result[1].members).toHaveLength(3);
		});
	});
});

describe("MergeByActivityStrategy", () => {
	let mergeByActivityStrategy: MergeByActivityStrategy;
	let activityService: ActivityService;
	let submissionService: SubmissionService;
	const courseId = "java-wise1920";

	const student = (name: string): ParticipantDto => {
		return { userId: name } as ParticipantDto;
	};

	const activityData: Awaited<ReturnType<ActivityService["getActivityData"]>> = [
		{
			user: student("A"),
			dates: [new Date(2022, 1, 1)]
		}
	];

	const submissions: Awaited<ReturnType<SubmissionService["getAllSubmissions"]>> = [
		[
			{
				assignmentId: "homework-01",
				userId: "A"
			} as SubmissionDto,
			{
				assignmentId: "homework-01",
				userId: "A"
			} as SubmissionDto,
			{
				assignmentId: "homework-01",
				userId: "B"
			} as SubmissionDto
		],
		3
	];

	const mock_ActivityService = (): Partial<ActivityService> => ({
		getActivityData: jest.fn().mockResolvedValue(activityData)
	});

	const mock_SubmissionService = (): Partial<SubmissionService> => ({
		getAllSubmissions: jest.fn().mockResolvedValue(submissions)
	});

	beforeEach(() => {
		activityService = mock_ActivityService() as ActivityService;
		submissionService = mock_SubmissionService() as SubmissionService;
		mergeByActivityStrategy = new MergeByActivityStrategy(activityService, submissionService);
	});

	it("Should be defined", () => {
		expect(mergeByActivityStrategy).toBeDefined();
	});

	it("No groups -> Returns empty list", async () => {
		const result = await mergeByActivityStrategy.merge(courseId, 2, 3, []);
		expect(result).toEqual([]);
	});

	it("No invalid groups -> Returns valid groups", async () => {
		const valid1 = group("Valid #1", ["A", "B", "C"]);
		const valid2 = group("Valid #2", ["D", "E"]);

		const groups: SimpleGroup[] = [valid1, valid2, group("Empty #1", [])];

		const result = await mergeByActivityStrategy.merge(courseId, 2, 3, groups);

		expect(result).toHaveLength(2);

		expect(result[0]).toEqual(valid1);
		expect(result[1]).toEqual(valid2);
	});

	it("Has invalid group -> Loads activity data", async () => {
		await mergeByActivityStrategy.merge(courseId, 2, 2, [group("A", ["Max"])]);
		expect(activityService.getActivityData).toHaveBeenCalledWith(courseId);
	});

	it("Has invalid group -> Loads submissions", async () => {
		await mergeByActivityStrategy.merge(courseId, 2, 2, [group("A", ["Max"])]);
		expect(submissionService.getAllSubmissions).toHaveBeenCalledWith(courseId);
	});

	it("Has invalid group -> Merges groups", async () => {
		const valid1 = group("Valid #1", ["A", "B", "C"]);
		const valid2 = group("Valid #2", ["D", "E"]);
		const invalid1 = group("Invalid #1", ["X"]);
		const invalid2 = group("Invalid #1", ["Y"]);

		const groups: SimpleGroup[] = [valid1, invalid1, valid2, group("Empty #1", []), invalid2];

		const result = await mergeByActivityStrategy.merge(courseId, 2, 3, groups);

		expect(result).toHaveLength(3);

		expect(result[0]).toEqual(valid1);
		expect(result[1]).toEqual(valid2);

		expect(result[2].id).toEqual(invalid1.id);
		expect(result[2].members).toHaveLength(2);
		expect(result[2].members[0].userId).toEqual("X");
		expect(result[2].members[1].userId).toEqual("Y");
	});
});

describe("mergeByActivity", () => {
	it("Returns list of valid and merged groups", async () => {
		const valid1 = group("Valid #1", ["A", "B", "C"]);
		const valid2 = group("Valid #2", ["D", "E"]);
		const invalid1 = group("Invalid #1", ["X"]);
		const invalid2 = group("Invalid #1", ["Y"]);

		const groups: SimpleGroup[] = [valid1, invalid1, valid2, group("Empty #1", []), invalid2];

		const result = mergeByActivity(2, 3, groups, { activity: [], submissions: [] });

		expect(result).toHaveLength(3);

		expect(result[0]).toEqual(valid1);
		expect(result[1]).toEqual(valid2);

		expect(result[2].id).toEqual(invalid1.id);
		expect(result[2].members).toHaveLength(2);
		expect(result[2].members[0].userId).toEqual("X");
		expect(result[2].members[1].userId).toEqual("Y");
	});

	it("Considers activity", () => {
		const invalid1 = group("Group #1", ["A"]);
		const invalid2 = group("Group #2", ["B"]);
		const invalid3 = group("Group #3", ["C"]);
		const invalid4 = group("Group #3", ["D"]);

		const groups: SimpleGroup[] = [invalid1, invalid2, invalid3, invalid4];

		const result = mergeByActivity(2, 2, groups, {
			activity: [
				{
					user: student("A"),
					dates: [new Date(2022, 1, 1)]
				},
				{
					user: student("B"),
					dates: [new Date(2022, 1, 1), new Date(2022, 2, 1), new Date(2022, 2, 1)]
				},
				{
					user: student("C"),
					dates: [new Date(2022, 1, 1), new Date(2022, 2, 1)]
				},
				{
					user: student("D"),
					dates: []
				}
			],
			submissions: []
		});

		expect(result).toHaveLength(2);

		const [mergedOne, mergedTwo] = result;

		expect(mergedOne.members[0].userId).toEqual("B");
		expect(mergedOne.members[1].userId).toEqual("C");

		expect(mergedTwo.members[0].userId).toEqual("A");
		expect(mergedTwo.members[1].userId).toEqual("D");
	});

	it("Considers submissions", () => {
		const invalid1 = group("Group #1", ["A"]);
		const invalid2 = group("Group #2", ["B"]);
		const invalid3 = group("Group #3", ["C"]);
		const invalid4 = group("Group #3", ["D"]);

		const groups: SimpleGroup[] = [invalid1, invalid2, invalid3, invalid4];

		const result = mergeByActivity(2, 2, groups, {
			activity: [],
			submissions: [
				submission("homework-01", "A"),
				submission("testat-02", "A"),
				submission("homework-01", "B"),
				submission("homework-01", "C"),
				submission("homework-01", "D"),
				submission("homework-02", "D"),
				submission("testat-02", "D")
			]
		});

		expect(result).toHaveLength(2);

		const [mergedOne, mergedTwo] = result;

		expect(mergedOne.members[0].userId).toEqual("D");
		expect(mergedOne.members[1].userId).toEqual("A");

		expect(mergedTwo.members[0].userId).toEqual("B");
		expect(mergedTwo.members[1].userId).toEqual("C");
	});

	it("Splits up invalid groups", () => {
		const groups: SimpleGroup[] = [
			group("Group #1", ["A", "B"]),
			group("Group #2", ["C", "D"]),
			group("Group #3", ["E", "F"])
		];

		const result = mergeByActivity(3, 3, groups, {
			activity: [],
			submissions: []
		});

		expect(result).toHaveLength(2);
		expect(result[0].members).toHaveLength(3);
		expect(result[1].members).toHaveLength(3);
	});

	it("Allows invalid group if no valid solution exists", () => {
		const groups: SimpleGroup[] = [
			group("Group #1", ["A", "B"]),
			group("Group #2", ["C", "D"]),
			group("Group #3", ["E", "F"]),
			group("Group #4", ["E", "F"])
		];

		const result = mergeByActivity(3, 3, groups, {
			activity: [],
			submissions: []
		});

		expect(result).toHaveLength(3);
		expect(result[0].members).toHaveLength(3);
		expect(result[1].members).toHaveLength(3);
		expect(result[2].members).toHaveLength(2);
	});
});

describe("getWeekOfYear (DayJs)", () => {
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

describe("isSame (week) (DayJs)", () => {
	test.each([
		[new Date(2022, 1, 1), new Date(2022, 1, 2), true],
		[new Date(2022, 1, 1), new Date(2022, 1, 7), false]
	])("%s same week as %s -> %s", (date1, date2, expected) => {
		const result = isSameWeek(date1, date2);
		expect(result).toEqual(expected);
	});
});

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
	it("Counts number of submitted assignments by user", () => {
		const userIds = new Set(["max", "moritz", "harry", "ronald"]);

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

describe("splitGroupsByValidity", () => {
	const group = (name: string, memberCount: number): SimpleGroup => {
		return {
			id: name,
			members: Array(memberCount).fill({} as ParticipantDto)
		};
	};

	it("Splits groups into valid, invalid and empty", () => {
		const groups = [
			group("empty", 0),
			group("invalid #1", 1),
			group("invalid #2", 1),
			group("valid #1", 2),
			group("valid #2", 3),
			group("valid #3", 4)
		];

		const { validGroups, invalidGroups, emptyGroups } = splitGroupsByValidity(groups, 2);

		expect(emptyGroups).toHaveLength(1);
		expect(invalidGroups).toHaveLength(2);
		expect(validGroups).toHaveLength(3);
	});
});

describe("bestSum", () => {
	test.each([
		[7, [5, 3, 4, 7], [7]],
		[8, [2, 3, 5], [5, 3]],
		[8, [1, 4, 5], [4, 4]],
		[3, [2, 4], undefined] // No valid combination exists
	])("Target: %d, Numbers: %s -> %s", (targetSum, numbers, expected) => {
		expect(bestSum(targetSum, numbers)).toEqual(expected);
	});
});

describe("calculateIdealGroupSizes", () => {
	test.each([
		[0, 2, 2, []], // 0 groups
		[2, 2, 2, [2]], // numberOfStudents == minSize
		[1, 2, 2, [1]], // numberOfStudent < minSize -> 1 invalid group
		[5, 3, 3, [3, 2]], // 1 Invalid group,
		[7, 3, 3, [3, 3, 1]], // 1 Invalid group,
		[4, 0, 2, [2, 2]],
		[6, 2, 3, [3, 3]],
		[5, 2, 3, [3, 2]],
		[7, 2, 3, [3, 2, 2]],
		[9, 2, 4, [4, 3, 2]],
		[9, 2, 5, [5, 4]]
	])("Students: %d, Min: %d, Max: %d -> %s", (numberOfStudents, minSize, maxSize, expected) => {
		expect(calculateIdealGroupSizes(numberOfStudents, minSize, maxSize)).toEqual(expected);
	});
});

describe("mergeInvalidGroups", () => {
	const student = (name: string, group: string): ParticipantDto => {
		return {
			userId: name,
			groupId: group
		} as ParticipantDto;
	};

	it("Picks groupId from first student in group", () => {
		const rankedStudents: ParticipantDto[] = [
			student("Max", "A"),
			student("Moritz", "B"),
			student("Harry", "B"),
			student("Ronald", "C")
		];

		const idealGroupSizes = [2, 2];

		const groups = mergeInvalidGroups(idealGroupSizes, rankedStudents);

		expect(groups).toHaveLength(2);

		const [groupA, groupB] = groups;

		expect(groupA.id).toEqual("A");
		expect(groupB.id).toEqual("B");

		expect(groupA.members[0].userId).toEqual("Max");
		expect(groupA.members[1].userId).toEqual("Moritz");

		expect(groupB.members[0].userId).toEqual("Harry");
		expect(groupB.members[1].userId).toEqual("Ronald");
	});

	it("GroupIds not available -> Picks groupId from remaining groups", () => {
		const rankedStudents: ParticipantDto[] = [
			student("Max", "A"),
			student("Moritz", "B"),
			student("Harry", "A"),
			student("Ronald", "A")
		];

		const idealGroupSizes = [2, 2];

		const groups = mergeInvalidGroups(idealGroupSizes, rankedStudents);

		expect(groups).toHaveLength(2);

		const [groupA, groupB] = groups;

		expect(groupA.id).toEqual("A");
		expect(groupB.id).toEqual("B");

		expect(groupA.members[0].userId).toEqual("Max");
		expect(groupA.members[1].userId).toEqual("Moritz");

		expect(groupB.members[0].userId).toEqual("Harry");
		expect(groupB.members[1].userId).toEqual("Ronald");
	});
});
