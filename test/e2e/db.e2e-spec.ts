import { StudentMgmtDbEntities } from "../utils/demo-db";
import { Assessment } from "../../src/assessment/entities/assessment.entity";
import { Assignment } from "../../src/course/entities/assignment.entity";
import { Course } from "../../src/course/entities/course.entity";
import { Group } from "../../src/course/entities/group.entity";
import { Participant } from "../../src/course/entities/participant.entity";
import { User } from "../../src/shared/entities/user.entity";
import { TestSetup } from "../utils/e2e";
import { EXAMPLE_CONFIG } from "../db-setup/example";
import { DEMO_CONFIG } from "../db-setup/demo";
import { DbMockService } from "../mocks/db-mock.service";
import { ISUM_ONLY_CONFIG } from "../db-setup/isum-only";

describe("StudentMgmtDbEntities", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
		await setup.clearDb();
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("constructor", () => {
		it("Maps configuration to entities", () => {
			const data = EXAMPLE_CONFIG;
			const result = new StudentMgmtDbEntities(data);
			expect(result.users).toHaveLength(data.users.length);
			expect(result.users[0].settings).toBeDefined();
			expect(result.courses).toHaveLength(data.courses.length);
			expect(result.courses[0].config).toBeDefined();
			expect(result.courses[0].config.groupSettings).toBeDefined();
			expect(result.courses[0].config.admissionCriteria).toBeDefined();
			expect(result.assignments.length).toBeGreaterThan(0);
			expect(result.groups.length).toBeGreaterThan(0);
			expect(result.assessments.length).toBeGreaterThan(0);
		});
	});

	describe("populateDatabase", () => {
		const data = EXAMPLE_CONFIG;

		beforeAll(async () => {
			await new StudentMgmtDbEntities(data).populateDatabase(setup.connection);
		});

		it("Creates users", async () => {
			const userRepo = setup.connection.getRepository(User);
			const users = await userRepo.find({
				relations: ["settings"]
			});

			const user = users[0];
			expect(users).toHaveLength(data.users.length);
			expect(user.settings).toBeDefined();
		});

		it("Creates courses", async () => {
			const courseRepo = setup.connection.getRepository(Course);
			const courses = await courseRepo.find({
				relations: [
					"config",
					"config.groupSettings",
					"config.admissionCriteria",
					"participants"
				]
			});

			const course = courses[0];

			expect(courses).toHaveLength(1);
			expect(course.id).toEqual(EXAMPLE_CONFIG.courses[0].data.id);
			expect(course.config).toBeDefined();
			expect(course.config.groupSettings).toBeDefined();
			expect(course.config.admissionCriteria).toBeDefined();
		});

		it("Creates participants", async () => {
			const participantsRepo = setup.connection.getRepository(Participant);
			const participants = await participantsRepo.find();

			const participant = participants[0];

			expect(participants).toHaveLength(4);
			expect(participant.courseId).toEqual("datda-sose2022");
		});

		it("Creates groups", async () => {
			const repo = setup.connection.getRepository(Group);
			const groups = await repo.find({
				relations: ["userGroupRelations", "userGroupRelations.user"]
			});

			const [gryffindor, slytherin] = groups;

			expect(groups).toHaveLength(2);
			expect(groups[0].userGroupRelations).toHaveLength(2);
			expect(groups[1].userGroupRelations).toHaveLength(1);
			expect(gryffindor.userGroupRelations[0].user.displayName).toEqual("Harry Potter");
			expect(gryffindor.userGroupRelations[1].user.displayName).toEqual("Ron Weasley");
			expect(slytherin.userGroupRelations[0].user.displayName).toEqual("Draco Malfoy");
		});

		it("Creates assignments", async () => {
			const repo = setup.connection.getRepository(Assignment);
			const assignments = await repo.find();

			expect(assignments).toHaveLength(2);
		});

		it("Creates assessments", async () => {
			const repo = setup.connection.getRepository(Assessment);
			const assessments = await repo.find({
				relations: ["partialAssessments", "assessmentUserRelations", "assignment"]
			});

			const [a1_gryffindor, a1_slytherin, a2_dmalfoy] = assessments;

			expect(assessments).toHaveLength(3);

			expect(a1_gryffindor.assignment.name).toEqual("Assignment 01");
			expect(a1_slytherin.assignment.name).toEqual("Assignment 01");
			expect(a2_dmalfoy.assignment.name).toEqual("Assignment 02");

			expect(a1_gryffindor.groupId).toBeDefined();
			expect(a1_slytherin.groupId).toBeDefined();

			expect(a1_gryffindor.assessmentUserRelations).toHaveLength(2);
			expect(a1_slytherin.assessmentUserRelations).toHaveLength(1);
			expect(a2_dmalfoy.assessmentUserRelations).toHaveLength(1);

			expect(a2_dmalfoy.partialAssessments).toHaveLength(1);
			expect(a2_dmalfoy.partialAssessments[0].markers).toHaveLength(1);
		});
	});

	describe("Demo Config", () => {
		it("Insert", async () => {
			await setup.clearDb();
			await new StudentMgmtDbEntities(DEMO_CONFIG).populateDatabase(setup.connection);
		});
	});

	describe("ISUM Extension", () => {
		it("Insert", async () => {
			await setup.clearDb();
			await new DbMockService(setup.connection).createAll();
			await new StudentMgmtDbEntities(ISUM_ONLY_CONFIG).populateDatabase(setup.connection);

			const participantsRepo = setup.connection.getRepository(Participant);
			const participants = await participantsRepo.find({
				relations: ["user"]
			});

			const dumbledore = participants.filter(p => p.user.username === "dumbledore");

			expect(dumbledore).toHaveLength(4);
		});
	});
});
