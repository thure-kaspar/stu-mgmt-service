import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection } from 'typeorm';
import { DbMockService } from "./mocks/db-mock.service";
import { UserDto } from "../src/shared/dto/user.dto";
import { UserRole } from "../src/shared/enums";
import { CoursesMock } from "./mocks/courses.mock";
import { GroupsMock } from "./mocks/groups.mock";
import { UsersMock, USER_STUDENT_JAVA } from "./mocks/users.mock";
import { AssignmentsMock } from "./mocks/assignments.mock";
import { AssessmentsMock } from "./mocks/assessments.mock";
import { createApplication } from "./mocks/application.mock";

let app: INestApplication;
let dbMockService: DbMockService; // Should be initialized in every describe-block

const courses = CoursesMock;
const groups = GroupsMock;
const users = UsersMock;
const assignments = AssignmentsMock;
const assessments = AssessmentsMock;

describe('GET-REQUESTS of UserController (e2e)', () => {
	
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

	it("(GET) /users Retrieves all users", () => {
		return request(app.getHttpServer())
			.get("/users")
			.expect(({ body }) => {
				expect(body.length).toEqual(users.length);
			});
	});

});

describe('POST-REQUESTS of UserController (e2e)', () => {
	
	beforeEach(async () => {
		app = await createApplication();

		// Setup mocks
		const dbMockService = new DbMockService(getConnection());
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /users Creates the given user and returns it", () => {
		return request(app.getHttpServer())
			.post("/users")
			.send(USER_STUDENT_JAVA)
			.expect(201)
			.expect(({ body }) => {
				expect(body.email).toEqual(USER_STUDENT_JAVA.email);
			})
	});
	
});

describe('PATCH-REQUESTS (Db contains data) of GroupController (e2e)', () => {

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

	it("(PATCH) /users/{userId} Updates the user", () => {
		const user = USER_STUDENT_JAVA;
		// Create clone of original data and perform some changes
		let changedUser = new UserDto();
		Object.assign(changedUser, user);

		changedUser.email = "new@email.test";
		changedUser.role = UserRole.MGMT_ADMIN;

		return request(app.getHttpServer())
			.patch(`/users/${user.id}`)
			.send(changedUser)
			.expect(({ body }) => {
				expect(body.id).toEqual(user.id) // Check if we retrieved the correct user
				expect(body.email).toEqual(changedUser.email);
				expect(body.role).toEqual(changedUser.role);
			})
	});

});

describe('DELETE-REQUESTS (Db contains data) of GroupController (e2e)', () => {

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

	it("(DELETE) /users/{userId} Deletes the user", () => {
		return request(app.getHttpServer())
			.delete(`/users/${USER_STUDENT_JAVA.id}`)
			.expect(200) // TODO: 
	});

});


