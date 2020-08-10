import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { AssignmentDto } from "../../src/course/dto/assignment/assignment.dto";
import { createApplication } from "../mocks/application.mock";
import { ASSIGNMENT_JAVA_CLOSED, ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP, ASSIGNMENT_JAVA_IN_REVIEW_SINGLE, ASSIGNMENTS_ALL, ASSIGNMENTS_JAVA_1920 } from "../mocks/assignments.mock";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { DbMockService } from "../mocks/db-mock.service";


let app: INestApplication;
let dbMockService: DbMockService;

const course = COURSE_JAVA_1920; // the course that will be used for testing

describe("GET-REQUESTS of AssignmentController (e2e)", () => {

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

	it("(GET) /courses/{courseId}/assignments Retrieves all assignments of a course", () => {
		const expected = ASSIGNMENTS_JAVA_1920.length;
		console.assert(expected > 1, "There should be multiple assignments");

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/assignments`)
			.expect(({ body }) => {
				expect(body.length).toEqual(expected); 
			});
	});

	it("(GET) /courses/{courseId}/assignments/{assignmentId} Retrieves the assignment", () => {
		const assignment = ASSIGNMENT_JAVA_IN_REVIEW_SINGLE;

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/assignments/${assignment.id}`)
			.expect(({ body }) => {
				const result = body as AssignmentDto;
				expect(result.id).toEqual(assignment.id);
				expect(result.state).toEqual(assignment.state);
			});
	});

});

describe("POST-REQUESTS of AssignmentController (e2e)", () => {

	beforeEach(async () => {
		app = await createApplication();

		// Setup mocks
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createCourses();
		await dbMockService.createUsers();
		await dbMockService.createParticipants();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /courses/{courseId}/assignments Creates the given assignment and returns it", () => {
		const assignment = ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP;

		return request(app.getHttpServer())
			.post(`/courses/${course.id}/assignments`)
			.send(assignment)
			.expect(201)
			.expect(({ body }) => {
				const result = body as AssignmentDto;
				expect(result.name).toEqual(assignment.name);
				expect(result.type).toEqual(assignment.type);
				expect(result.points).toEqual(assignment.points);
			});
	});

});

describe("PATCH-REQUESTS of AssignmentController (e2e)", () => {

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

	it("(PATCH) /courses/{courseId}/assignments/{assignmentId} Updates the assignment", () => {
		const assignment = ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP;

		// Create clone of original data and perform some changes
		const changedAssignment = new AssignmentDto();
		Object.assign(changedAssignment, assignment);

		changedAssignment.name = "new name";
		changedAssignment.points = 1000;
		changedAssignment.comment = "new comment";

		return request(app.getHttpServer())
			.patch(`/courses/${course.id}/assignments/${assignment.id}`)
			.send(changedAssignment)
			.expect(({ body }) => {
				expect(body.id).toEqual(assignment.id); // Check if we retrieved the correct assignment
				expect(body.name).toEqual(changedAssignment.name);
				expect(body.points).toEqual(changedAssignment.points);
				expect(body.comment).toEqual(changedAssignment.comment);
			});
	});

});

describe("DELETE-REQUESTS of AssignmentController (e2e)", () => {

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

	it("(DELETE) /courses/{courseId}/assignments/{assignmentId} Deletes the assignment", () => {
		const assignment = ASSIGNMENT_JAVA_CLOSED;

		return request(app.getHttpServer())
			.delete(`/courses/${course.id}/assignments/${assignment.id}`)
			.expect(200);
	});

});
