import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { SubmissionDto } from "../../src/submission/submission.dto";
import { createApplication } from "../mocks/application.mock";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { DbMockService } from "../mocks/db-mock.service";
import { SUBMISSION_USER_1_ASSIGNMENT_IN_PROGRESS_HOMEWORK_GROUP_1 } from "../mocks/submissions.mock";

let app: INestApplication;
let dbMockService: DbMockService; // Should be initialized in every describe-block

const course = COURSE_JAVA_1920;
const submission = SUBMISSION_USER_1_ASSIGNMENT_IN_PROGRESS_HOMEWORK_GROUP_1;

describe("POST-Requests of SubmissionController (e2e)", () => {
	beforeEach(async () => {
		app = await createApplication();
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	describe("(POST) /courses/:courseId/submissions/assignments/:assignmentId", () => {
		const route = (courseId, assignmentId) =>
			`/courses/${courseId}/submissions/assignments/${assignmentId}`;
		it("Adds a submission", () => {
			return request(app.getHttpServer())
				.post(route(course.id, submission.assignmentId))
				.expect(201)
				.expect(({ body }) => {
					const result = body as unknown;
					expect(result).toEqual(42);
				});
		});
	});
});

describe("GET-Requests of SubmissionController (e2e)", () => {
	beforeAll(async () => {
		app = await createApplication();
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterAll(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	describe("(GET) /courses/:courseId/submissions", () => {
		const route = courseId => `/courses/${courseId}/submissions`;

		it("Retrieves all submissions", () => {
			return request(app.getHttpServer())
				.get(route(course.id))
				.expect(200)
				.expect(({ body }) => {
					const result = body as SubmissionDto[];
					expect(result).toMatchSnapshot();
				});
		});
	});

	describe("(GET) /courses/:courseId/submissions/users/:userId", () => {
		const route = (courseId, userId) => `/courses/${courseId}/submissions/users/${userId}`;

		it("Retrieves all submissions of user", () => {
			return request(app.getHttpServer())
				.get(route(course.id, submission.userId))
				.expect(200)
				.expect(({ body }) => {
					const result = body as SubmissionDto[];
					expect(result).toMatchSnapshot();
				});
		});
	});

	describe("(GET) /courses/:courseId/submissions/groups/:groupId/assignments/:assignmentId", () => {
		const route = (courseId, groupId, assignmentId) =>
			`/courses/${courseId}/submissions/groups/${groupId}/assignments/${assignmentId}`;

		it("Retrieves all submissions of a group for an assignment", () => {
			return request(app.getHttpServer())
				.get(route(course.id, submission.groupId, submission.assignmentId))
				.expect(200)
				.expect(({ body }) => {
					const result = body as SubmissionDto[];
					expect(result).toMatchSnapshot();
				});
		});
	});

	describe("(GET) /courses/:courseId/submissions/users/:user/assignments/:assignments", () => {
		const route = (courseId, userId, assignmentId) =>
			`/courses/${courseId}/submissions/users/${userId}/assignments/${assignmentId}`;

		it("Retrieves the latest submission of a user (or their group) for an assignment", () => {
			return request(app.getHttpServer())
				.get(route(course.id, submission.userId, submission.assignmentId))
				.expect(200)
				.expect(({ body }) => {
					const result = body as SubmissionDto;
					expect(result).toMatchSnapshot();
				});
		});
	});
});

describe("DELETE-Requests of SubmissionController (e2e)", () => {
	beforeEach(async () => {
		app = await createApplication();
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	describe("(POST) /courses/:courseId/submissions/assignments/:assignmentId", () => {
		const route = (courseId, assignmentId) =>
			`/courses/${courseId}/submissions/assignments/${assignmentId}`;
		it("Deletes all submissions of an assignment", () => {
			return request(app.getHttpServer())
				.delete(route(course.id, submission.assignmentId))
				.expect(200);
		});
	});
});
