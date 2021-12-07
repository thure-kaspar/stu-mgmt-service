import { SubmissionDto } from "../../src/submission/submission.dto";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { SUBMISSION_USER_1_ASSIGNMENT_IN_PROGRESS_HOMEWORK_GROUP_1 } from "../mocks/submissions.mock";
import { TestSetup } from "../utils/e2e";

const course = COURSE_JAVA_1920;
const submission = SUBMISSION_USER_1_ASSIGNMENT_IN_PROGRESS_HOMEWORK_GROUP_1;

describe("Submission E2E", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("POST-Requests of SubmissionController (e2e)", () => {
		beforeEach(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("(POST) /courses/:courseId/submissions/assignments/:assignmentId", () => {
			const route = (courseId, assignmentId) =>
				`/courses/${courseId}/submissions/assignments/${assignmentId}`;
			it("Adds a submission", () => {
				return setup
					.request()
					.post(route(course.id, submission.assignmentId))
					.send(submission)
					.expect(201)
					.expect(({ body }) => {
						const result = body as SubmissionDto;
						result.date = null;
						expect(result).toMatchSnapshot();
					});
			});
		});
	});

	describe("GET-Requests of SubmissionController (e2e)", () => {
		beforeAll(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("(GET) /courses/:courseId/submissions", () => {
			const route = courseId => `/courses/${courseId}/submissions`;

			it("Retrieves all submissions", () => {
				return setup
					.request()
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
				return setup
					.request()
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
				return setup
					.request()
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
				return setup
					.request()
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
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("(DELETE) /courses/:courseId/submissions/assignments/:assignmentId", () => {
			const route = (courseId, assignmentId) =>
				`/courses/${courseId}/submissions/assignments/${assignmentId}`;
			it("Deletes all submissions of an assignment", () => {
				return setup
					.request()
					.delete(route(course.id, submission.assignmentId))
					.expect(200);
			});
		});
	});
});
