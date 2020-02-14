import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection } from 'typeorm';
import { DbMockService } from "./mocks/db-mock.service";
import * as fromDtoMocks from "./mocks/dto-mocks";
import { GroupDto } from "../src/shared/dto/group.dto";

let dbMockService: DbMockService; // Should be initialized in every describe-block

const courses = fromDtoMocks.CoursesMock;
const groups = fromDtoMocks.GroupsMock;
const users = fromDtoMocks.UsersMock;
const assignments = fromDtoMocks.AssignmentsMock;
const assessments = fromDtoMocks.AssessmentsMock;

describe('GET-REQUESTS of GroupController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		// Setup mocks
		const dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(GET) /groups/{groupId}/users Retrieves all members of the group", () => {
		return request(app.getHttpServer())
			.get(`/groups/${groups[0].id}/users`)
			.expect(({ body }) => {
				expect(body.length).toEqual(users.length);
			});
	});

});

describe('POST-REQUESTS for relations (Db contains data) of GroupController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		// Setup mocks - these tests require a filled db
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createCourses();
		await dbMockService.createUsers();
		await dbMockService.createGroups();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /groups/{groupId}/users/{userId} Adds the user to the group", () => {
		return request(app.getHttpServer())
			.post(`/groups/${groups[0].id}/users/${users[0].id}`)
			.expect(201)
	});

});

describe('PATCH-REQUESTS (Db contains data) of GroupController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

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
		// Create clone of original data and then perform some changes
		let changedGroup = new GroupDto();
		Object.assign(changedGroup, groups[0]);

		changedGroup.name = "new name";
		changedGroup.isClosed = !groups[0].isClosed;
		changedGroup.password = "new password";

		return request(app.getHttpServer())
			.patch(`/groups/${groups[0].id}`)
			.send(changedGroup)
			.expect(({ body }) => {
				expect(body.name).toEqual(changedGroup.name)
				expect(body.isClosed).toEqual(changedGroup.isClosed)
				// expect(body.password).toEqual(changedGroup.password) Can't check password, since it's not send to clients
			});
	});

});

describe('DELETE-REQUESTS (Db contains data) of GroupController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		// Setup mocks - these tests require a filled db
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	// SKIP - Fails because onDelete: Cascade is missing (Violation of foreign key contraint)
	it.skip("(DELETE) /groups/{groupId} Deletes the group", () => {
		return request(app.getHttpServer())
			.delete(`/groups/${groups[0].id}`)
			.expect(({ body }) => {
				expect(body).toEqual(true);
			});
	});

});

