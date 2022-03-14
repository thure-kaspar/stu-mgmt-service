import { Course } from "../../../src/course/entities/course.entity";
import { GroupSettings } from "../../../src/course/entities/group-settings.entity";
import { Group as GroupEntity } from "../../../src/course/entities/group.entity";
import { Participant as ParticipantEntity } from "../../../src/course/entities/participant.entity";
import { CourseWithGroupSettings } from "../../../src/course/models/course-with-group-settings.model";
import { Group } from "../../../src/course/models/group.model";
import { Participant } from "../../../src/course/models/participant.model";
import { GroupMergeStrategy } from "../../../src/course/services/group-merge.strategy";
import { User } from "../../../src/shared/entities/user.entity";

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
	it("merge", async () => {
		expect(1).toEqual(1);
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
