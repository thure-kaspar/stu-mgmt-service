import { StudentMgmtDbData, StudentMgmtDbEntities } from "../utils/demo-db";
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
import { AssignmentRegistration } from "../../src/course/entities/assignment-group-registration.entity";
import { CourseRole } from "../../src/shared/enums";
import { SubscriberRepository } from "../../src/notification/subscriber/subscriber.repository";
import { Subscriber } from "../../src/notification/subscriber/subscriber.entity";
import { GroupEvent } from "../../src/course/entities/group-event.entity";
import { Submission } from "../../src/submission/submission.entity";
import { TESTING_CONFIG } from "../db-setup/testing";

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
		const data = EXAMPLE_CONFIG;
		let result: StudentMgmtDbEntities;

		beforeAll(() => {
			result = new StudentMgmtDbEntities(data);
		});

		it("Creates users with settings", () => {
			expect(result.users).toHaveLength(data.users.length);
			expect(result.users[0].settings).toBeDefined();
		});

		it("Creates courses with config", () => {
			expect(result.courses).toHaveLength(data.courses.length);
			expect(result.courses[0].config).toBeDefined();
			expect(result.courses[0].config.groupSettings).toBeDefined();
			expect(result.courses[0].config.admissionCriteria).toBeDefined();
		});

		it("Adds participants to courses", () => {
			expect(result.courses[0].participants).toHaveLength(4);

			const [dumbledore, hpotter, rweasley, dmalfoy] = result.courses[0].participants;

			expect(dumbledore.role).toEqual(CourseRole.LECTURER);
			expect(hpotter.role).toEqual(CourseRole.STUDENT);
			expect(rweasley.role).toEqual(CourseRole.STUDENT);
			expect(dmalfoy.role).toEqual(CourseRole.STUDENT);
		});

		it("Creates groups", () => {
			expect(result.groups.length).toBeGreaterThan(0);
		});

		it("Adds members to groups", () => {
			expect(result.groups[0].userGroupRelations.length).toBeGreaterThan(0);
		});

		it("Creates assignments", () => {
			expect(result.assignments.length).toBeGreaterThan(0);
		});

		it("Creates assessments with partialAssessments", () => {
			expect(result.assessments.length).toBeGreaterThan(0);
			expect(result.assessments[2].partialAssessments.length).toBeGreaterThan(0);
		});

		it("Creates assignment registrations with relations", () => {
			expect(result.registrations.length).toBeGreaterThan(0);

			expect(result.registrations[0].groupRelations).toHaveLength(2); // Gryffindor
			expect(result.registrations[0].groupRelations[0].participant.id).toEqual(1); // hpotter
			expect(result.registrations[0].groupRelations[1].participant.id).toEqual(2); // rweasley

			expect(result.registrations[1].groupRelations).toHaveLength(1); // Slytherin
			expect(result.registrations[1].groupRelations[0].participant.id).toEqual(3); // dmalfoy
		});

		it("Creates subscribers", () => {
			expect(result.subscribers).toHaveLength(1);
		});

		it("Creates group events", () => {
			expect(result.groupEvents).toHaveLength(2);
		});

		it("Creates submissions", () => {
			expect(result.submissions).toHaveLength(1);
		});
	});

	describe("populateDatabase", () => {
		const data = EXAMPLE_CONFIG;

		beforeAll(async () => {
			await new StudentMgmtDbEntities(data).populateDatabase(setup.dataSource);
		});

		it("Creates users", async () => {
			const userRepo = setup.dataSource.getRepository(User);
			const users = await userRepo.find({
				relations: ["settings"]
			});

			const user = users[0];
			expect(users).toHaveLength(data.users.length);
			expect(user.settings).toBeDefined();
		});

		it("Creates courses", async () => {
			const courseRepo = setup.dataSource.getRepository(Course);
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
			const participantsRepo = setup.dataSource.getRepository(Participant);
			const participants = await participantsRepo.find();

			const participant = participants[0];

			expect(participants).toHaveLength(4);
			expect(participant.courseId).toEqual("datda-sose2022");
		});

		it("Creates groups", async () => {
			const repo = setup.dataSource.getRepository(Group);
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
			const repo = setup.dataSource.getRepository(Assignment);
			const assignments = await repo.find();

			expect(assignments).toHaveLength(2);
		});

		it("Creates assessments", async () => {
			const repo = setup.dataSource.getRepository(Assessment);
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

		it("Creates assignment registrations", async () => {
			const repo = setup.dataSource.getRepository(AssignmentRegistration);
			const registrations = await repo.find({
				relations: [
					"groupRelations",
					"groupRelations.participant",
					"groupRelations.participant.user"
				]
			});

			const [gryffindor, slytherin] = registrations;

			expect(registrations).toHaveLength(2);

			expect(gryffindor.groupRelations).toHaveLength(2);
			expect(slytherin.groupRelations).toHaveLength(1);

			expect(gryffindor.groupRelations[0].participant.user.username).toEqual("hpotter");
			expect(gryffindor.groupRelations[1].participant.user.username).toEqual("rweasley");
			expect(slytherin.groupRelations[0].participant.user.username).toEqual("dmalfoy");
		});

		it("Creates subscribers", async () => {
			const repo = setup.dataSource.getRepository(Subscriber);
			const subscribers = await repo.find();
			expect(subscribers).toHaveLength(1);
		});

		it("Creates group events", async () => {
			const repo = setup.dataSource.getRepository(GroupEvent);
			const events = await repo.find();
			expect(events).toHaveLength(2);
		});

		it("Creates submissions", async () => {
			const repo = setup.dataSource.getRepository(Submission);
			const submissions = await repo.find();
			expect(submissions).toHaveLength(1);
		});
	});

	describe("Demo Config", () => {
		it("Insert", async () => {
			await setup.clearDb();
			await new StudentMgmtDbEntities(DEMO_CONFIG).populateDatabase(setup.dataSource);

			const courseRepo = setup.dataSource.getRepository(Course);
			const courses = await courseRepo.find();

			expect(courses).toHaveLength(8);
		});
	});

	describe("Testing Config", () => {
		it("Insert", async () => {
			await setup.clearDb();
			await new StudentMgmtDbEntities(TESTING_CONFIG).populateDatabase(setup.dataSource);

			const courseRepo = setup.dataSource.getRepository(Course);
			const courses = await courseRepo.find();

			expect(courses).toHaveLength(4);
		});
	});
});
