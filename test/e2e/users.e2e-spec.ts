import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { DbMockService } from "../mocks/db-mock.service";
import { UserDto } from "../../src/shared/dto/user.dto";
import { UserRole, CollaborationType } from "../../src/shared/enums";
import { UsersMock, USER_STUDENT_JAVA, USER_MGMT_ADMIN_JAVA_LECTURER } from "../mocks/users.mock";
import { createApplication } from "../mocks/application.mock";
import { copy } from "../utils/object-helper";
import { CourseDto } from "../../src/course/dto/course/course.dto";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { GROUP_1_JAVA } from "../mocks/groups/groups.mock";
import { GroupDto } from "../../src/course/dto/group/group.dto";
import { GROUP_EVENT_REJOIN_SCENARIO } from "../mocks/groups/group-events.mock";
import { ASSIGNMENT_JAVA_CLOSED, ASSIGNMENT_JAVA_TESTAT_IN_PROGRESS_SINGLE, ASSIGNMENT_JAVA_INVISIBLE } from "../mocks/assignments.mock";
import { GroupEventDto } from "../../src/course/dto/group/group-event.dto";
import { AssignmentGroupTuple } from "../../src/user/dto/assignment-group-tuple.dto";

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

	it("(GET) /users/{userId}/courses Retrieves the user's group in a course", () => {
		const course = COURSE_JAVA_1920;
		const expected = GROUP_1_JAVA;

		return request(app.getHttpServer())
			.get(`/users/${user.id}/courses/${course.id}/groups`)
			.expect(({ body }) => {
				const result = body as GroupDto;
				expect(result.id).toEqual(expected.id);
				expect(result.courseId).toEqual(expected.courseId);
				expect(result.name).toEqual(expected.name);
			});
	});

	describe("(GET) /users/{userId}/courses/{courseId}/group-history", () => {
		const course = COURSE_JAVA_1920;

		it("Retrieves the user's group history in a course (sorted by timestamp descending)", () => {
			
			const expected = GROUP_EVENT_REJOIN_SCENARIO().reverse(); // Ordered from new to old
			const expectedJson = JSON.parse(JSON.stringify(expected)) as GroupEventDto[];

			return request(app.getHttpServer())
				.get(`/users/${user.id}/courses/${course.id}/group-history`)
				.expect(({ body }) => {
					const result = body as GroupDto[];
					expect(result).toEqual(expectedJson);
				});
		});
	
	});

	describe("(GET) /users/{userId}/courses/{courseId}/assignments/{assignmentId}/group", () => {
		const course = COURSE_JAVA_1920;

		it("Retrieves the user's group at the time of assignment's end date", () => {
			const assignment = ASSIGNMENT_JAVA_CLOSED;
			console.assert(!!assignment.endDate, "Assignment must have an end date.");
			const expected = GROUP_1_JAVA;
	
			return request(app.getHttpServer())
				.get(`/users/${user.id}/courses/${course.id}/assignments/${assignment.id}/group`)
				.expect(({ body }) => {
					const result = body as GroupDto;
					expect(result.id).toEqual(expected.id);
					expect(result.courseId).toEqual(expected.courseId);
					expect(result.name).toEqual(expected.name);
				});
		});

		it("Assignment had no end date -> Returns current group", () => {
			const assignment = ASSIGNMENT_JAVA_INVISIBLE;
			const expected = GROUP_1_JAVA;
			console.assert(!assignment.endDate, "Assignment must have no end date.");
			console.assert(assignment.collaboration !== CollaborationType.SINGLE, "CollaborationType should not be SINGLE.");
	
			return request(app.getHttpServer())
				.get(`/users/${user.id}/courses/${course.id}/assignments/${assignment.id}/group`)
				.expect(({ body }) => {
					const result = body as GroupDto;
					expect(result.id).toEqual(expected.id);
					expect(result.courseId).toEqual(expected.courseId);
					expect(result.name).toEqual(expected.name);
				});
		});

		it("User had no group -> Returns empty object", () => {
			const assignment = ASSIGNMENT_JAVA_CLOSED;
			const userNoGroup = USER_MGMT_ADMIN_JAVA_LECTURER;
			console.assert(!!assignment.endDate, "Assignment must have an end date.");
	
			return request(app.getHttpServer())
				.get(`/users/${userNoGroup.id}/courses/${course.id}/assignments/${assignment.id}/group`)
				.expect(({ body }) => {
					const result = body as GroupDto;
					expect(result).toEqual({});
				});
		});
	
	});

	describe("(GET) /users/{userId}/courses/{courseId}/assignments/groups", () => {
		const course = COURSE_JAVA_1920;
		const currentGroup = GROUP_1_JAVA;

		it("Retrieves the user's groups for all assignments", () => {
			// TODO: Create a more complicated scenario with test data instead of using implicit knowledge about data
			return request(app.getHttpServer())
				.get(`/users/${user.id}/courses/${course.id}/assignments/groups`)
				.expect(({ body }) => {
					const result = body as AssignmentGroupTuple[];
					result.forEach(entry => {

						if (entry.assignment.collaboration === CollaborationType.SINGLE) {
							expect(entry.group).toBeFalsy();
						} else {
							expect(entry.group.id).toEqual(currentGroup.id);
						}

					});
				});
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


