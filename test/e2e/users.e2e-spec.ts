import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { DbMockService } from "../mocks/db-mock.service";
import { UserDto } from "../../src/shared/dto/user.dto";
import { UserRole } from "../../src/shared/enums";
import { UsersMock, USER_STUDENT_JAVA } from "../mocks/users.mock";
import { createApplication } from "../mocks/application.mock";
import { copy } from "../utils/object-helper";
import { CourseDto } from "../../src/course/dto/course/course.dto";

let app: INestApplication;
let dbMockService: DbMockService; // Should be initialized in every describe-block

const users = UsersMock;
const user = copy(USER_STUDENT_JAVA);

describe("GET-REQUESTS of UserController (e2e)", () => {
	
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

	it("(GET) /users/{userId} Retrieves the user by id", () => {
		return request(app.getHttpServer())
			.get(`/users/${user.id}`)
			.expect(({ body }) => {
				const result = body as UserDto;
				expect(result.id).toEqual(user.id);
				expect(result.email).toEqual(user.email);
				expect(result.role).toEqual(user.role);
				expect(result.rzName).toEqual(user.rzName);
				expect(result.username).toEqual(user.username);
			});
	});

	it("(GET) /users/email/{email} Retrieves the user by email", () => {
		return request(app.getHttpServer())
			.get(`/users/email/${user.email}`)
			.expect(({ body }) => {
				const result = body as UserDto;
				expect(result.id).toEqual(user.id);
				expect(result.email).toEqual(user.email);
				expect(result.role).toEqual(user.role);
				expect(result.rzName).toEqual(user.rzName);
				expect(result.username).toEqual(user.username);
			});
	});

	it("(GET) /users/{userId}/courses Retrieves the courses of the user", () => {
		return request(app.getHttpServer())
			.get(`/users/${user.id}/courses`)
			.expect(({ body }) => {
				const result = body as CourseDto[];
				expect(result[0].id).toBeTruthy();
			});
	});

});

describe("POST-REQUESTS of UserController (e2e)", () => {
	
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
			});
	});
	
});

describe("PATCH-REQUESTS (Db contains data) of GroupController (e2e)", () => {

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
		const changedUser = new UserDto();
		Object.assign(changedUser, user);

		changedUser.email = "new@email.test";
		changedUser.role = UserRole.MGMT_ADMIN;

		return request(app.getHttpServer())
			.patch(`/users/${user.id}`)
			.send(changedUser)
			.expect(({ body }) => {
				expect(body.id).toEqual(user.id); // Check if we retrieved the correct user
				expect(body.email).toEqual(changedUser.email);
				expect(body.role).toEqual(changedUser.role);
			});
	});

});

describe("DELETE-REQUESTS (Db contains data) of GroupController (e2e)", () => {

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
			.expect(200); // TODO: 
	});

});


