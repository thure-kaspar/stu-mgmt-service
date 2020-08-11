import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { GroupCreateBulkDto } from "../../src/course/dto/group/group-create-bulk.dto";
import { GroupEventDto } from "../../src/course/dto/group/group-event.dto";
import { GroupDto } from "../../src/course/dto/group/group.dto";
import { GroupWithAssignedEvaluatorDto } from "../../src/course/queries/groups-with-assigned-evaluator/group-with-assigned-evaluator.dto";
import { createApplication, createApplication_STUDENT } from "../mocks/application.mock";
import { ASSESSMENT_ALLOCATIONS_MOCK } from "../mocks/assessment-allocation.mock";
import { AssessmentsMock } from "../mocks/assessments.mock";
import { ASSIGNMENTS_ALL, ASSIGNMENT_JAVA_IN_REVIEW_SINGLE } from "../mocks/assignments.mock";
import { CoursesMock, COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { DbMockService } from "../mocks/db-mock.service";
import { GROUP_EVENTS_MOCK } from "../mocks/groups/group-events.mock";
import { GROUPS_ALL, GROUPS_JAVA_1920, GROUP_1_JAVA, GROUP_2_JAVA } from "../mocks/groups/groups.mock";
import { UserGroupRelationsMock } from "../mocks/groups/user-group-relations.mock";
import { UsersMock, USER_MGMT_ADMIN_JAVA_LECTURER, USER_STUDENT_JAVA } from "../mocks/users.mock";
import { copy } from "../utils/object-helper";

let app: INestApplication;
let dbMockService: DbMockService; // Should be initialized in every describe-block

const courses = CoursesMock;
const groups = GROUPS_ALL;
const users = UsersMock;
const assignments = ASSIGNMENTS_ALL;
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

	describe("(GET) /courses/{courseId}/groups", () => {
	
		it("Retrieves all groups of a course", () => {
			const expectedLength = GROUPS_JAVA_1920.length;
			console.assert(expectedLength > 1, "Course should have multiple groups");
	
			return request(app.getHttpServer())
				.get(`/courses/${course.id}/groups`)
				.expect(({ body }) => {
					const result = body as GroupDto[];
					expect(result.length).toEqual(expectedLength);
					expect(result[0].members).toBeTruthy();
				});
		});
	
		it("Retrieves groups matching a name", () => {
			const name = "group 1";
			const expectedLength = GROUPS_JAVA_1920.filter(g => g.name.includes(name)).length;
			console.assert(expectedLength >= 1, "At least one group name should match.");
	
			const queryString = `name=${name}`;
	
			return request(app.getHttpServer())
				.get(`/courses/${course.id}/groups?${queryString}`)
				.expect(({ body }) => {
					const result = body as GroupDto[];
					expect(body.length).toEqual(expectedLength);
					expect(result[0].members).toBeTruthy();
					expect(result[0].members.length).toBeGreaterThan(0);
				});
		});
	
		it("Only retrieves groups that are closed", () => {
			const expectedLength = GROUPS_JAVA_1920.filter(g => g.isClosed).length;
			console.assert(expectedLength >= 1, "At least one group name should match.");
	
			const queryString = "isClosed=true";
	
			return request(app.getHttpServer())
				.get(`/courses/${course.id}/groups?${queryString}`)
				.expect(({ body }) => {
					const result = body as GroupDto[];
					expect(body.length).toEqual(expectedLength);
	
					result.forEach(group => {
						expect(group.isClosed).toEqual(true);
					});
				});
		});
	
		it("Only retrieves groups that are NOT closed", () => {
			const expectedLength = GROUPS_JAVA_1920.filter(g => !g.isClosed).length;
			console.assert(expectedLength >= 1, "At least one group name should match.");
	
			const queryString = "isClosed=false";
	
			return request(app.getHttpServer())
				.get(`/courses/${course.id}/groups?${queryString}`)
				.expect(({ body }) => {
					const result = body as GroupDto[];
					expect(body.length).toEqual(expectedLength);
	
					result.forEach(group => {
						expect(group.isClosed).toEqual(false);
					});
				});
		});
	
	});

	it("(GET) /groups/{groupId} Retrieves the group with all relations", () => {
		const group = copy(GROUP_1_JAVA);
		group.history = GROUP_EVENTS_MOCK;

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/groups/${group.id}`)
			.expect(({ body }) => {
				const result = body as GroupDto;
				expect(result.id).toEqual(group.id);
				expect(result.members.length).toEqual(2);
				expect(result.history).toBeTruthy();
				expect(result.history.length).toBeGreaterThan(1);
				expect(result.password).toBeUndefined();

				result.history.forEach(event => {
					expect(event.groupId).toEqual(group.id);
				});

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

	describe("(GET) /groups/assignments/{assignmentId}/with-assigned-evaluator", () => {
		const assignment = ASSIGNMENT_JAVA_IN_REVIEW_SINGLE;

		it("Returns groups with their assigned evaluator", () => {
			return request(app.getHttpServer())
				.get(`/courses/${course.id}/groups/assignments/${assignment.id}/with-assigned-evaluator`)
				.expect(({ body }) => {
					const result = body as GroupWithAssignedEvaluatorDto[];
					expect(result.length).toEqual(3);
					expect(result[0].assignedEvaluatorId).toEqual(USER_STUDENT_JAVA.id);
					expect(result[1].assignedEvaluatorId).toEqual(USER_MGMT_ADMIN_JAVA_LECTURER.id);
					expect(result[2].assignedEvaluatorId).toBeUndefined();
				});
		});

		it("Filter by evaluator -> Only returns groups for this evaluator", () => {
			console.assert(ASSESSMENT_ALLOCATIONS_MOCK.filter(a => 
				a.assignedEvaluatorId === USER_STUDENT_JAVA.id).length == 1,
			"Evaluator should be assigned to exactly one group"
			);
			console.assert(USER_STUDENT_JAVA.id === "a019ea22-5194-4b83-8d31-0de0dc9bca53", "UserId must be correct.");

			return request(app.getHttpServer())
				.get(`/courses/${course.id}/groups/assignments/${assignment.id}/with-assigned-evaluator?assignedEvaluatorId=a019ea22-5194-4b83-8d31-0de0dc9bca53`)
				.expect(({ body }) => {
					const result = body as GroupWithAssignedEvaluatorDto[];
					expect(result.length).toEqual(1);
					expect(result[0].assignedEvaluatorId).toEqual(USER_STUDENT_JAVA.id);
				});
		});

		it("Pagination -> Returns partial result", () => {
			const skip = 1;
			const take = 1;

			return request(app.getHttpServer())
				.get(`/courses/${course.id}/groups/assignments/${assignment.id}/with-assigned-evaluator?skip=${skip}&take=${take}`)
				.expect(({ body }) => {
					const result = body as GroupWithAssignedEvaluatorDto[];
					expect(result.length).toEqual(1);
					expect(result[0].group.id).toEqual(GROUP_2_JAVA.id);
				});
		});
	
	});

});

describe("POST-REQUESTS for relations of GroupController (e2e)", () => {
	let app: INestApplication;

	const setupMocks = async () => {
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createCourses();
		await dbMockService.createCourseConfig();
		await dbMockService.createGroupSettings();
		await dbMockService.createUsers();
		await dbMockService.createGroups();
		await dbMockService.createParticipants();
	};

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	describe("As LECTURER", () => {
	
		beforeEach(async () => {
			app = await createApplication();
			await setupMocks();
		});

		describe("courses/{courseId}/groups - createGroup", () => {

			const route = `/courses/${course.id}/groups`;
		
			describe("Valid", () => {
			
				it("As LECTURER -> Creates Group", () => {
					const group: GroupDto = {
						name: "New group",
						password: "123"
					};
	
					return request(app.getHttpServer())
						.post(route)
						.send(group)
						.expect(201)
						.expect(({ body }) => {
							const result = body as GroupDto;
							expect(result.name).toEqual(group.name);
						});
				});
			
			});
	
			describe("Invalid", () => {
		
				it("Empty name -> 400 BadRequest", () => {
					const group = {
						...GROUP_1_JAVA,
						name: ""
					};
	
					return request(app.getHttpServer())
						.post(route)
						.send(group)
						.expect(400);
				});
			});
		
		});
	
		describe("courses/{courseId}/groups/bulk - createMultipleGroups", () => {
	
			const route = `/courses/${course.id}/groups/bulk`;
	
			describe("Valid", () => {
			
				it("Creates multiple groups via name list", () => {
					const groups: GroupCreateBulkDto = {
						names: [
							"Group 1",
							"Group 2",
							"Group 3"
						]
					};
	
					return request(app.getHttpServer())
						.post(route)
						.expect(201)
						.send(groups)
						.expect(({ body }) => {
							const result = body as GroupDto[];
							expect(result.length).toEqual(groups.names.length);
							expect(result[0].name).toEqual(groups.names[0]);
							expect(result[1].name).toEqual(groups.names[1]);
							expect(result[2].name).toEqual(groups.names[2]);
						});
				});
	
				it("Creates multiple groups via name schema and count", () => {
					const groups: GroupCreateBulkDto = {
						nameSchema: "JAVA",
						count: 10
					};
	
					return request(app.getHttpServer())
						.post(route)
						.send(groups)
						.expect(201)
						.expect(({ body }) => {
							const result = body as GroupDto[];
							expect(result.length).toEqual(groups.count);
	
							result.forEach(group => {
								// Group name uses schema
								expect(group.name.includes(groups.nameSchema)).toBeTruthy();
							});
						});
				});
			
			});
	
			describe("Invalid", () => {
				
				it("Name list contains duplicate -> 400 Bad Request", () => {
					const groups: GroupCreateBulkDto = {
						names: [
							"Duplicate",
							"Group 1",
							"Duplicate"
						]
					};
	
					return request(app.getHttpServer())
						.post(route)
						.send(groups)
						.expect(400);
				});
	
				it("Name schema with missing count -> 400 Bad Request", () => {
					const groups: GroupCreateBulkDto = {
						nameSchema: "JAVA-Group",
						count: undefined // Count is missing!
					};
	
					return request(app.getHttpServer())
						.post(route)
						.send()
						.expect(400);
				});
	
				it("No names or name schema defined -> 400 Bad Request", () => {
					const groups: GroupCreateBulkDto = {
						count: 10
					};
	
					return request(app.getHttpServer())
						.post(route)
						.send(groups)
						.expect(400);
				});
			
			});
		
		});

		describe("courses/{courseId}/groups/{groupId}/users/{userId} - addUserToGroup", () => {
		
			it("No password -> Adds user", () => {
				const group = GROUP_1_JAVA;
				console.assert(group.password, "Expecting group to have a password.");
		
				return request(app.getHttpServer())
					.post(`/courses/${course.id}/groups/${group.id}/users/${users[0].id}`)
					.expect(201);
			});
		
			it("Group is closed -> Adds user", () => {
				const group = GROUP_2_JAVA;
				console.assert(group.isClosed, "Expecting group to be closed.");
		
				return request(app.getHttpServer())
					.post(`/courses/${course.id}/groups/${group.id}/users/${users[0].id}`)
					.expect(201);
			});
		
		});
	});

	describe("As STUDENT", () => {
	
		beforeEach(async () => {
			app = await createApplication_STUDENT();
			await setupMocks();
		});

		describe("courses/{courseId}/groups/{groupId}/users/{userId} - addUserToGroup", () => {
	
			it("Correct password -> Adds the user to the group", () => {
				const group = GROUP_1_JAVA;
		
				return request(app.getHttpServer())
					.post(`/courses/${course.id}/groups/${group.id}/users/${users[0].id}`)
					.send({ password: group.password })
					.expect(201);
			});
		
			it("Incorrect password -> 403 BadRequest", () => {
				const group = GROUP_1_JAVA;
				console.assert(group.password, "Expecting group to have a password.");
		
				return request(app.getHttpServer())
					.post(`/courses/${course.id}/groups/${group.id}/users/${users[0].id}`)
					.send({ password: "wrong_password" })
					.expect(403);
			});
		
			it("Group is closed -> 403 Forbidden", () => {
				const group = GROUP_2_JAVA;
				console.assert(group.isClosed, "Expecting group to be closed.");
		
				return request(app.getHttpServer())
					.post(`/courses/${course.id}/groups/${group.id}/users/${users[0].id}`)
					.send({ password: group.password })
					.expect(403);
			});
		
		});
	
	});

});

describe("PATCH-REQUESTS (Db contains data) of GroupController (e2e)", () => {
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

	describe("courses/{courseId}/groups/{groupId} - updateGroup", () => {
	
		describe("Valid", () => {
		
			it("Updates the group", () => {
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
					.expect(200)
					.expect(({ body }) => {
						expect(body.name).toEqual(changedGroup.name);
						expect(body.isClosed).toEqual(changedGroup.isClosed);
						// expect(body.password).toEqual(changedGroup.password) Can't check password, since it's not send to clients
					});
			});
		
		});

		describe("Invalid", () => {
		
			
		
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

