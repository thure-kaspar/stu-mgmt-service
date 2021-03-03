import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { createApplication } from "../mocks/application.mock";
import {
	ASSIGNMENT_JAVA_INVISIBLE,
	ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP
} from "../mocks/assignments.mock";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { DbMockService } from "../mocks/db-mock.service";
import { UserId } from "../../src/shared/entities/user.entity";
import { GroupId } from "../../src/course/entities/group.entity";
import { GROUP_1_JAVA } from "../mocks/groups/groups.mock";
import { USER_STUDENT_JAVA } from "../mocks/users.mock";
import { AssignmentId } from "../../src/course/entities/assignment.entity";
import { GroupDto } from "../../src/course/dto/group/group.dto";

let app: INestApplication;
let dbMockService: DbMockService;
const courseId = COURSE_JAVA_1920.id;
const baseRoute = `/courses/${courseId}/assignments`;

describe("As LECTURER", () => {
	beforeEach(async () => {
		app = await createApplication();

		// Setup mocks
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	describe("POST-REQUESTS of AssignmentRegistrationController", () => {
		describe("/courses/{courseId}/assignments/{assignmentId}/registrations - _registerAllGroups", () => {
			let assignmentId;
			const route = () => `${baseRoute}/${assignmentId}/registrations`;

			beforeEach(() => {
				assignmentId = ASSIGNMENT_JAVA_INVISIBLE.id;
			});

			it("Creates registrations for all groups", () => {
				return request(app.getHttpServer()).post(route()).expect(201);
			});
		});

		describe("courses/{courseId}/assignments/{assignmentId}/registrations/groups/{groupId}/members/{userId} - registerParticipantAsGroupMember", () => {
			let assignmentId;
			let groupId: GroupId;
			let userId: UserId;
			const route = () =>
				`${baseRoute}/${assignmentId}/registrations/groups/${groupId}/members/${userId}`;

			beforeEach(() => {
				assignmentId = ASSIGNMENT_JAVA_INVISIBLE.id;
				groupId = GROUP_1_JAVA.id;
				userId = USER_STUDENT_JAVA.id;
			});

			it("Creates registration user as member of group", () => {
				return request(app.getHttpServer()).post(route()).expect(201);
			});
		});
	});

	describe("DELETE-REQUESTS of AssignmentRegistrationController", () => {
		let assignmentId: AssignmentId;
		let groupId: GroupId;
		let userId: UserId;
		const route = () => `${baseRoute}/${assignmentId}/registrations`;

		beforeEach(() => {
			assignmentId = ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP.id;
			groupId = GROUP_1_JAVA.id;
			userId = USER_STUDENT_JAVA.id;
		});

		describe("/courses/{courseId}/assignments/{assignmentId}/registrations/groups/{groupId} - unregisterGroup", () => {
			it("Unregisters the group", () => {
				return request(app.getHttpServer())
					.delete(`${route()}/groups/${groupId}`)
					.expect(200);
			});
		});

		describe("/courses/{courseId}/assignments/{assignmentId}/registrations/users/{userId} - unregisterUser", () => {
			it("Unregisters the user", () => {
				return request(app.getHttpServer())
					.delete(`${route()}/users/${userId}`)
					.expect(200);
			});
		});

		describe("/courses/{courseId}/assignments/{assignmentId}/registrations - unregisterAll", () => {
			it("Unregisters all users", () => {
				return request(app.getHttpServer()).delete(route()).expect(200);
			});
		});
	});
});

describe("GET-REQUESTS of AssignmentRegistrationController", () => {
	const assignmentId = ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP.id;
	const baseRoute = `/courses/${courseId}/assignments/${assignmentId}/registrations`;

	beforeAll(async () => {
		app = await createApplication();

		// Setup mocks
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterAll(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	describe("/course/{courseId}/assignments/{assignmentId}/registrations - getRegisteredGroups", () => {
		it("Assignment IN_PROGRESS -> Returns registered groups", () => {
			return request(app.getHttpServer())
				.get(`${baseRoute}/groups`)
				.expect(200)
				.expect(({ body }) => {
					const result = body as GroupDto[];
					expect(result.length).toBeGreaterThan(1);
					expect(result[0].members).toBeTruthy();
					expect(result[0].members.length).toBeGreaterThan(0);
				});
		});
	});

	describe("/course/{courseId}/assignments/{assignmentId}/registrations/groups/{groupId} - getRegisteredGroup", () => {
		let groupId: GroupId;
		const route = () => `${baseRoute}/groups/${groupId}`;

		beforeEach(() => {
			groupId = GROUP_1_JAVA.id;
		});

		it("Assignment IN_PROGRESS -> Returns the group", () => {
			return request(app.getHttpServer())
				.get(route())
				.expect(200)
				.expect(({ body }) => {
					const result = body as GroupDto;
					expect(result).toBeTruthy();
					expect(result.members.length).toBeGreaterThan(1);
				});
		});
	});

	describe("/course/{courseId}/assignments/{assignmentId}/registrations/users/{userId} - getRegisteredGroupOfUser", () => {
		let userId: UserId;
		const route = () => `${baseRoute}/users/${userId}`;

		beforeEach(() => {
			userId = USER_STUDENT_JAVA.id;
		});

		it("Assignment IN_PROGRESS -> Returns user's group", () => {
			return request(app.getHttpServer())
				.get(route())
				.expect(200)
				.expect(({ body }) => {
					const result = body as GroupDto;
					expect(result).toBeTruthy();
					expect(result.members.length).toBeGreaterThan(1);
				});
		});
	});
});
