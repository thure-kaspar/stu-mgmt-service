import { createApplication_STUDENT } from "../mocks/application.mock";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { DbMockService } from "../mocks/db-mock.service";
import { GROUP_1_JAVA, GROUP_2_JAVA } from "../mocks/groups/groups.mock";
import { UsersMock } from "../mocks/users.mock";
import { TestSetup } from "../utils/e2e";

const setupMocks = async (dbMockService: DbMockService) => {
	await dbMockService.createCourses();
	await dbMockService.createCourseConfig();
	await dbMockService.createGroupSettings();
	await dbMockService.createUsers();
	await dbMockService.createGroups();
	await dbMockService.createParticipants();
};

const users = UsersMock;
const course = COURSE_JAVA_1920; // The course that will be used for testing

describe("As STUDENT", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create(createApplication_STUDENT);
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("courses/{courseId}/groups/{groupId}/users/{userId} - addUserToGroup", () => {
		beforeEach(async () => {
			await setup.clearDb();
			await setupMocks(setup.dbMockService);
		});

		it("Correct password -> Adds the user to the group", () => {
			const group = GROUP_1_JAVA;

			return setup
				.request()
				.post(`/courses/${course.id}/groups/${group.id}/users/${users[0].id}`)
				.send({ password: group.password })
				.expect(201);
		});

		it("Incorrect password -> 400 BadRequest", () => {
			const group = GROUP_1_JAVA;
			console.assert(group.password, "Expecting group to have a password.");

			return setup
				.request()
				.post(`/courses/${course.id}/groups/${group.id}/users/${users[0].id}`)
				.send({ password: "wrong_password" })
				.expect(400);
		});

		it("Group is closed -> 403 Forbidden", () => {
			const group = GROUP_2_JAVA;
			console.assert(group.isClosed, "Expecting group to be closed.");

			return setup
				.request()
				.post(`/courses/${course.id}/groups/${group.id}/users/${users[0].id}`)
				.send({ password: group.password })
				.expect(403);
		});
	});
});
