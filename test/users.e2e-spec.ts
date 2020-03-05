import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection } from 'typeorm';
import { DbMockService } from "./mocks/db-mock.service";
import * as fromDtoMocks from "./mocks/dto-mocks";
import { UserDto } from "../src/shared/dto/user.dto";
import { UserRoles } from "../src/shared/enums";

let dbMockService: DbMockService; // Should be initialized in every describe-block

const courses = fromDtoMocks.CoursesMock;
const groups = fromDtoMocks.GroupsMock;
const users = fromDtoMocks.UsersMock;
const assignments = fromDtoMocks.AssignmentsMock;
const assessments = fromDtoMocks.AssessmentsMock;

describe('GET-REQUESTS of UserController (e2e)', () => {
	let app: INestApplication;
	
	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		// Setup mocks
		const dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterAll(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(GET) /users Retrieves all users", () => {
		return request(app.getHttpServer())
			.get("/users")
			.expect(({ body }) => {
				expect(body.length).toEqual(users.length);
			});
	});

});

describe('POST-REQUESTS of UserController (e2e)', () => {
	let app: INestApplication;
	
	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		// Setup mocks
		const dbMockService = new DbMockService(getConnection());
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /users Creates the given user and returns it (Part 1/2)", () => {
		return request(app.getHttpServer())
			.post("/users")
			.send(users[0])
			.expect(201)
			.expect(({ body }) => {
				expect(body.email).toEqual(users[0].email);
			})
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
		await dbMockService.createAll();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(PATCH) /users/{userId} Updates the user", () => {
		// Create clone of original data and perform some changes
		let changedUser = new UserDto();
		Object.assign(changedUser, users[0]);

		changedUser.email = "new@email.test";
		changedUser.role = UserRoles.TUTOR;

		return request(app.getHttpServer())
			.patch(`/users/${users[0].id}`)
			.send(changedUser)
			.expect(({ body }) => {
				expect(body.id).toEqual(users[0].id) // Check if we retrieved the correct user
				expect(body.email).toEqual(changedUser.email);
				expect(body.role).toEqual(changedUser.role);
			})
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

	it("(DELETE) /users/{userId} Deletes the user", () => {
		return request(app.getHttpServer())
			.delete(`/users/${users[0].id}`)
			.expect(200) // TODO: 
	});

});


