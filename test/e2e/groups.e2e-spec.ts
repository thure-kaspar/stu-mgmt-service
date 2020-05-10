import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { DbMockService } from "../mocks/db-mock.service";
import * as fromDtoMocks from "../mocks/relations.mock";
import { GroupDto } from "../../src/course/dto/group/group.dto";
import { CoursesMock, COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { GroupsMock, GROUP_1_JAVA } from "../mocks/groups.mock";
import { UsersMock } from "../mocks/users.mock";
import { AssignmentsMock } from "../mocks/assignments.mock";
import { AssessmentsMock } from "../mocks/assessments.mock";
import { createApplication } from "../mocks/application.mock";

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

	it("(GET) /groups/{groupId}/users Retrieves all members of the group", () => {
		const group = GROUP_1_JAVA;
		const memberCount = fromDtoMocks.UserGroupRelationsMock.filter(user => user.groupId === group.id).length;
		console.assert(memberCount > 1, "The tested group should contains multiple users! Member count: ", memberCount);

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/groups/${group.id}/users`)
			.expect(({ body }) => {
				expect(body.length).toEqual(memberCount);
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

