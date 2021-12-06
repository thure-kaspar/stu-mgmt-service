import { getConnection } from "typeorm";
import { CourseDto } from "../../src/course/dto/course/course.dto";
import { GroupEventDto } from "../../src/course/dto/group/group-event.dto";
import { GroupDto } from "../../src/course/dto/group/group.dto";
import { UserDto } from "../../src/shared/dto/user.dto";
import { CollaborationType, UserRole } from "../../src/shared/enums";
import { AssignmentGroupTuple } from "../../src/user/dto/assignment-group-tuple.dto";
import {
	ASSIGNMENT_JAVA_CLOSED,
	ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP
} from "../mocks/assignments.mock";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { GROUP_EVENT_REJOIN_SCENARIO } from "../mocks/groups/group-events.mock";
import { GROUP_1_JAVA } from "../mocks/groups/groups.mock";
import { UsersMock, USER_MGMT_ADMIN_JAVA_LECTURER, USER_STUDENT_JAVA } from "../mocks/users.mock";
import { TestSetup } from "../utils/e2e";
import { copy } from "../utils/object-helper";

const users = UsersMock;
const user = copy(USER_STUDENT_JAVA);

describe("Users E2E", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("GET-REQUESTS of UserController (e2e)", () => {
		beforeAll(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("(GET) /users", () => {
			it("Retrieves all users", () => {
				return setup
					.request()
					.get("/users")
					.expect(({ body }) => {
						expect(body.length).toEqual(users.length);
					});
			});

			it("Filters by username", () => {
				const username = "m";
				const expected = UsersMock.filter(u => u.username.includes(username)).length;

				const queryString = `username=${username}`;

				console.assert(expected > 0, "Expecting >0 users to match the given username.");

				return setup
					.request()
					.get(`/users?${queryString}`)
					.expect(({ body }) => {
						expect(body.length).toEqual(expected);
					});
			});

			it("Filters by displayName", () => {
				const displayName = "m";
				const expected = UsersMock.filter(u => u.displayName.includes(displayName)).length;

				const queryString = `displayName=${displayName}`;

				console.assert(expected > 0, "Expecting >0 users to match the given displayName.");

				return setup
					.request()
					.get(`/users?${queryString}`)
					.expect(({ body }) => {
						expect(body.length).toEqual(expected);
					});
			});

			it("Filters by role (Single)", () => {
				const role = UserRole.MGMT_ADMIN;
				const expected = UsersMock.filter(u => u.role === role).length;

				const queryString = `roles=${role}`;

				console.assert(expected > 0, "Expecting >0 users to match the given role.");

				return setup
					.request()
					.get(`/users?${queryString}`)
					.expect(({ body }) => {
						expect(body.length).toEqual(expected);
					});
			});

			it("Filters by roles (Multiple)", () => {
				const role1 = UserRole.MGMT_ADMIN;
				const role2 = UserRole.USER;
				const expected = UsersMock.filter(u => u.role === role1 || u.role === role2).length;

				const queryString = `roles=${role1}&roles=${role2}`;

				console.assert(expected > 0, "Expecting >0 users to match the given roles.");

				return setup
					.request()
					.get(`/users?${queryString}`)
					.expect(({ body }) => {
						expect(body.length).toEqual(expected);
					});
			});

			it("Uses pagination", () => {
				const skip = 1;
				const take = 2;

				const queryString = `skip=${skip}&take=${take}`;

				return setup
					.request()
					.get(`/users?${queryString}`)
					.expect(({ body }) => {
						expect(body.length).toEqual(take);
					});
			});
		});

		it("(GET) /users/{userId} Retrieves the user by id", () => {
			return setup
				.request()
				.get(`/users/${user.id}`)
				.expect(({ body }) => {
					const result = body as UserDto;
					expect(result.id).toEqual(user.id);
					expect(result.email).toEqual(user.email);
					expect(result.role).toEqual(user.role);
					expect(result.displayName).toEqual(user.displayName);
					expect(result.username).toEqual(user.username);
				});
		});

		it("(GET) /users/email/{email} Retrieves the user by email", () => {
			return setup
				.request()
				.get(`/users/email/${user.email}`)
				.expect(({ body }) => {
					const result = body as UserDto;
					expect(result.id).toEqual(user.id);
					expect(result.email).toEqual(user.email);
					expect(result.role).toEqual(user.role);
					expect(result.displayName).toEqual(user.displayName);
					expect(result.username).toEqual(user.username);
				});
		});

		it("(GET) /users/{userId}/courses Retrieves the courses of the user", () => {
			return setup
				.request()
				.get(`/users/${user.id}/courses`)
				.expect(({ body }) => {
					const result = body as CourseDto[];
					expect(result[0].id).toBeTruthy();
				});
		});

		it("(GET) /users/{userId}/courses Retrieves the user's group in a course", () => {
			const course = COURSE_JAVA_1920;
			const expected = GROUP_1_JAVA;

			return setup
				.request()
				.get(`/users/${user.id}/courses/${course.id}/groups`)
				.expect(({ body }) => {
					const result = body as GroupDto;
					expect(result.id).toEqual(expected.id);
					expect(result.name).toEqual(expected.name);
				});
		});

		describe("(GET) /users/{userId}/courses/{courseId}/group-history", () => {
			const course = COURSE_JAVA_1920;

			it("Retrieves the user's group history in a course (sorted by timestamp descending)", () => {
				const expected = GROUP_EVENT_REJOIN_SCENARIO().reverse(); // Ordered from new to old
				const expectedJson = JSON.parse(JSON.stringify(expected)) as GroupEventDto[];

				return setup
					.request()
					.get(`/users/${user.id}/courses/${course.id}/group-history`)
					.expect(({ body }) => {
						const result = body as GroupDto[];
						expect(result).toEqual(expectedJson);
					});
			});
		});

		describe("(GET) /users/{userId}/courses/{courseId}/assignments/{assignmentId}/group", () => {
			const course = COURSE_JAVA_1920;

			it("Retrieves the user's group for this assignment", () => {
				const assignment = ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP;
				const expected = GROUP_1_JAVA;

				console.assert(
					assignment.collaboration === CollaborationType.GROUP,
					"Expecting a group assignment."
				);

				return setup
					.request()
					.get(
						`/users/${user.id}/courses/${course.id}/assignments/${assignment.id}/group`
					)
					.expect(200)
					.expect(({ body }) => {
						const result = body as GroupDto;
						expect(result.id).toEqual(expected.id);
						expect(result.name).toEqual(expected.name);
					});
			});

			it("User had no group -> 404", () => {
				const assignment = ASSIGNMENT_JAVA_CLOSED;
				const userNoGroup = USER_MGMT_ADMIN_JAVA_LECTURER;

				return setup
					.request()
					.get(
						`/users/${userNoGroup.id}/courses/${course.id}/assignments/${assignment.id}/group`
					)
					.expect(404);
			});
		});

		describe("(GET) /users/{userId}/courses/{courseId}/assignments/groups", () => {
			const course = COURSE_JAVA_1920;
			const currentGroup = GROUP_1_JAVA;

			it("Retrieves the user's groups for all assignments", () => {
				// TODO: Create a more complicated scenario with test data instead of using implicit knowledge about data
				return setup
					.request()
					.get(`/users/${user.id}/courses/${course.id}/assignments/groups`)
					.expect(200)
					.expect(({ body }) => {
						const result = body as AssignmentGroupTuple[];
						expect(result.length).toBeGreaterThan(3);
						result.forEach(entry => {
							expect(entry.assignment).toBeTruthy();
							expect(entry.group).toBeTruthy();
							expect(entry.group.id).toEqual(currentGroup.id);
						});
					});
			});
		});
	});

	describe("POST-REQUESTS of UserController (e2e)", () => {
		beforeEach(async () => {
			await setup.clearDb();
		});

		it("(POST) /users Creates the given user and returns it", () => {
			return setup
				.request()
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
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		it("(PATCH) /users/{userId} Updates the user", () => {
			const user = USER_STUDENT_JAVA;
			// Create clone of original data and perform some changes
			const changedUser = new UserDto();
			Object.assign(changedUser, user);

			changedUser.email = "new@email.test";
			changedUser.role = UserRole.MGMT_ADMIN;

			return setup
				.request()
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
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		it("(DELETE) /users/{userId} Deletes the user", () => {
			return setup.request().delete(`/users/${USER_STUDENT_JAVA.id}`).expect(200); // TODO:
		});
	});
});
