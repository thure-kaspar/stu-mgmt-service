import { GroupDto } from "../../src/course/dto/group/group.dto";
import { GroupId } from "../../src/course/entities/group.entity";
import { UserId } from "../../src/shared/entities/user.entity";
import {
	ASSIGNMENT_JAVA_INVISIBLE,
	ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP
} from "../mocks/assignments.mock";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { GROUP_1_JAVA } from "../mocks/groups/groups.mock";
import { USER_STUDENT_JAVA } from "../mocks/users.mock";
import { TestSetup } from "../utils/e2e";

const courseId = COURSE_JAVA_1920.id;
const baseRoute = `/courses/${courseId}/assignments`;

describe("AssignmentRegistration E2E", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("POST-REQUESTS of AssignmentRegistrationController", () => {
		beforeEach(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("/courses/{courseId}/assignments/{assignmentId}/registrations - _registerAllGroups", () => {
			let assignmentId;
			const route = () => `${baseRoute}/${assignmentId}/registrations`;

			beforeEach(() => {
				assignmentId = ASSIGNMENT_JAVA_INVISIBLE.id;
			});

			it("Creates registrations for all groups", () => {
				return setup.request().post(route()).expect(201);
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
				return setup.request().post(route()).expect(201);
			});
		});
	});

	describe("GET-REQUESTS of AssignmentRegistrationController", () => {
		const assignmentId = ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP.id;
		const baseRoute = `/courses/${courseId}/assignments/${assignmentId}/registrations`;

		beforeAll(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("/course/{courseId}/assignments/{assignmentId}/registrations - getRegisteredGroups", () => {
			it("Assignment IN_PROGRESS -> Returns registered groups", () => {
				return setup
					.request()
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
				return setup
					.request()
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
				return setup
					.request()
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

	describe("DELETE-REQUESTS of AssignmentRegistrationController", () => {
		beforeEach(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		const route = () =>
			`${baseRoute}/${ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP.id}/registrations`;

		describe("/courses/{courseId}/assignments/{assignmentId}/registrations/groups/{groupId} - unregisterGroup", () => {
			it("Unregisters the group", () => {
				return setup.request().delete(`${route()}/groups/${GROUP_1_JAVA.id}`).expect(200);
			});
		});

		describe("/courses/{courseId}/assignments/{assignmentId}/registrations/users/{userId} - unregisterUser", () => {
			it("Unregisters the user", () => {
				return setup
					.request()
					.delete(`${route()}/users/${USER_STUDENT_JAVA.id}`)
					.expect(200);
			});
		});

		describe("/courses/{courseId}/assignments/{assignmentId}/registrations - unregisterAll", () => {
			it("Unregisters all users", () => {
				return setup.request().delete(route()).expect(200);
			});
		});
	});
});
