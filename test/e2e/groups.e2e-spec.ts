import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { DbMockService } from "../mocks/db-mock.service";
import { GroupDto } from "../../src/course/dto/group/group.dto";
import { CoursesMock, COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { GroupsMock, GROUP_1_JAVA, GROUP_2_JAVA } from "../mocks/groups/groups.mock";
import { UsersMock, USER_STUDENT_2_JAVA, USER_STUDENT_JAVA } from "../mocks/users.mock";
import { AssignmentsMock, ASSIGNMENT_JAVA_CLOSED, ASSIGNMENT_JAVA_EVALUATED, ASSIGNMENT_JAVA_INVISIBLE } from "../mocks/assignments.mock";
import { AssessmentsMock } from "../mocks/assessments.mock";
import { createApplication } from "../mocks/application.mock";
import { UserGroupRelationsMock } from "../mocks/groups/user-group-relations.mock";
import { copy } from "../utils/object-helper";
import { GROUP_EVENTS_MOCK } from "../mocks/groups/group-events.mock";
import { GroupEventDto } from "../../src/course/dto/group/group-event.dto";

let app: INestApplication;
let dbMockService: DbMockService; // Should be initialized in every describe-block

const courses = CoursesMock;
const groups = GroupsMock;
const users = UsersMock;
const assignments = AssignmentsMock;
const assessments = AssessmentsMock;

const course = COURSE_JAVA_1920; // The course that will be used for testing

describe("GET-REQUESTS of GroupController (e2e)", () => {
	
	beforeAll(async () => {
		app = await createApplication();

		// Setup mocks
		const dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterAll(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	// TODO: Adapt to code changes (new relations, changed history)
	it.skip("(GET) /groups/{groupId} Retrieves the group with all relations", () => {
		const group = copy(GROUP_1_JAVA);
		group.course = COURSE_JAVA_1920;
		group.history = GROUP_EVENTS_MOCK;
		group.users = [USER_STUDENT_JAVA, USER_STUDENT_2_JAVA];

		const expected = copy(group);
		expected.password = undefined; // Remove password due to it never being included in reponse
		expected.history.forEach(h => h.timestamp = undefined); // Remove timespamp due to it being a data instance instead of string

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/groups/${group.id}`)
			.expect(({ body }) => {
				const result = body as GroupDto;
				expect(result.history[0].timestamp).toBeTruthy();
				result.history.forEach(h => h.timestamp = undefined); // Remove timespamp due to it being a data instance instead of string
				expect(result).toEqual(expected);
			});
	});

	it("(GET) /groups/{groupId}/users Retrieves all members of the group", () => {
		const group = GROUP_1_JAVA;
		const memberCount = UserGroupRelationsMock.filter(user => user.groupId === group.id).length;
		console.assert(memberCount > 1, "The tested group should contains multiple users! Member count: ", memberCount);

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/groups/${group.id}/users`)
			.expect(({ body }) => {
				expect(body.length).toEqual(memberCount);
			});
	});

	describe("(GET) /groups/history", () => {
	
		it("Retrieves the complete group history of a course (sorted by timestamp descending)", () => {
			return request(app.getHttpServer())
				.get(`/courses/${course.id}/groups/history`)
				.expect(({ body }) => {
					const result = body as GroupEventDto[];
					expect(result.length).toBeGreaterThan(5); 
					// TODO: Check if sorting + data is correct (Deserialize date from JSON)
				});
		});
	
	});

	describe("(GET) /groups/{groupId}/assignments/{assigmentId}", () => {
	
		it("Generates a snapshot of the group's members at the time of the assignment's end date", () => {
			const assignment = ASSIGNMENT_JAVA_CLOSED;
			const group = GROUP_1_JAVA;

			return request(app.getHttpServer())
				.get(`/courses/${course.id}/groups/${group.id}/assignments/${assignment.id}`)
				.expect(({ body }) => {
					const result = body as GroupDto;
					expect(result).toBeTruthy();
					expect(result.users.length).toEqual(2);
				});
		});
	
	});

	describe("(GET) /groups/assignments/{assignmentId}", () => {
		
		it("Generates a snapshot of the group constellations at the time of the assignment's end date.", () => {
			const assignment = ASSIGNMENT_JAVA_CLOSED;

			return request(app.getHttpServer())
				.get(`/courses/${course.id}/groups/assignments/${assignment.id}`)
				.expect(({ body }) => {
					const result = body as GroupDto[];
					expect(result).toBeTruthy();
					expect(result.length).toEqual(2);
					expect(result[0].users.length).toEqual(2);
					expect(result[1].users.length).toEqual(0);
				});
		});
	
	});

});

describe("POST-REQUESTS for relations (Db contains data) of GroupController (e2e)", () => {
	let app: INestApplication;

	beforeEach(async () => {
		app = await createApplication();

		// Setup mocks - these tests require a filled db
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createCourses();
		await dbMockService.createCourseConfig();
		await dbMockService.createGroupSettings();
		await dbMockService.createUsers();
		await dbMockService.createGroups();
		await dbMockService.createCourseUserRelations();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /groups/{groupId}/users/{userId} Correct password, joining is possible -> Adds the user to the group", () => {
		const group = GROUP_1_JAVA;

		return request(app.getHttpServer())
			.post(`/courses/${course.id}/groups/${group.id}/users/${users[0].id}`)
			.send({ password: group.password })
			.expect(201);
	});

	it("(POST) /groups/{groupId}/users/{userId} Incorrect password -> 400 BadRequest", () => {
		const group = GROUP_1_JAVA;

		return request(app.getHttpServer())
			.post(`/courses/${course.id}/groups/${group.id}/users/${users[0].id}`)
			.send({ password: "wrong_password" })
			.expect(400);
	});

	it("(POST) /groups/{groupId}/users/{userId} Group is closed -> 409 Conflict", () => {
		const group = GROUP_1_JAVA;

		return request(app.getHttpServer())
			.post(`/courses/${course.id}/groups/${groups[1].id}/users/${users[0].id}`)
			.send({ password: groups[1].password })
			.expect(409);
	});

});

describe("PATCH-REQUESTS (Db contains data) of GroupController (e2e)", () => {
	let app: INestApplication;

	beforeEach(async () => {
		app = await createApplication();

		// Setup mocks - these tests require a filled db
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createCourses();
		await dbMockService.createGroups();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(PATCH) /groups/{groupId} Updates the group", () => {
		const group = GROUP_1_JAVA;

		// Create clone of original data and then perform some changes
		const changedGroup = new GroupDto();
		Object.assign(changedGroup, group);

		changedGroup.name = "new name";
		changedGroup.isClosed = !group.isClosed;
		changedGroup.password = "new password";

		return request(app.getHttpServer())
			.patch(`/courses/${course.id}/groups/${group.id}`)
			.send(changedGroup)
			.expect(({ body }) => {
				expect(body.name).toEqual(changedGroup.name);
				expect(body.isClosed).toEqual(changedGroup.isClosed);
				// expect(body.password).toEqual(changedGroup.password) Can't check password, since it's not send to clients
			});
	});

});

describe("DELETE-REQUESTS (Db contains data) of GroupController (e2e)", () => {
	let app: INestApplication;

	beforeEach(async () => {
		app = await createApplication();

		// Setup mocks - these tests require a filled db
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(DELETE) /groups/{groupId} Deletes the group", () => {
		const group = GROUP_1_JAVA;

		return request(app.getHttpServer())
			.delete(`/courses/${course.id}/groups/${group.id}`)
			.expect(200);
	});

});

