import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import { AssignmentDto } from "../src/shared/dto/assignment.dto";
import { createApplication } from "./mocks/application.mock";
import { ASSIGNMENT_JAVA_CLOSED, ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP, ASSIGNMENT_JAVA_IN_REVIEW } from "./mocks/assignments.mock";
import { COURSE_JAVA_1920 } from "./mocks/courses.mock";
import { DbMockService } from "./mocks/db-mock.service";


let app: INestApplication;
let dbMockService: DbMockService;

const course = COURSE_JAVA_1920; // the course that will be used for testing

describe('GET-REQUESTS of AssignmentController (e2e)', () => {

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
		return request(app.getHttpServer())
			.get(`/courses/${course.id}/assignments`)
			.expect(({ body }) => {
				expect(body.length).toEqual(7); 
			});
	});

	it("(GET) /courses/{courseId}/assignments/{assignmentId} Retrieves the assignment", () => {
		const assignment = ASSIGNMENT_JAVA_IN_REVIEW;

		return request(app.getHttpServer())
			.get(`/courses/${assignment.courseId}/assignments/${assignment.id}`)
			.expect(({ body }) => {
				const result = body as AssignmentDto;
				expect(result.id).toEqual(assignment.id);
				expect(result.courseId).toEqual(assignment.courseId);
				expect(result.state).toEqual(assignment.state);
			});
	});

});

describe('POST-REQUESTS of AssignmentController (e2e)', () => {

	beforeEach(async () => {
		app = await createApplication();

		// Setup mocks
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createCourses();
		await dbMockService.createUsers();
		await dbMockService.createCourseUserRelations();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /courses/{courseId}/assignments Creates the given assignment and returns it", () => {
		const assignment = ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP;

		return request(app.getHttpServer())
			.post(`/courses/${assignment.courseId}/assignments`)
			.send(assignment)
			.expect(201)
			.expect(({ body }) => {
				const result = body as AssignmentDto;
				expect(result.courseId).toEqual(assignment.courseId);
				expect(result.name).toEqual(assignment.name);
				expect(result.type).toEqual(assignment.type);
				expect(result.maxPoints).toEqual(assignment.maxPoints);
			});
	});

});

describe('PATCH-REQUESTS of AssignmentController (e2e)', () => {

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

	it("(PATCH) /courses/{courseId}/assignments/{assignmentId} Updates the assignment)", () => {
		const assignment = ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP;

		// Create clone of original data and perform some changes
		let changedAssignment = new AssignmentDto();
		Object.assign(changedAssignment, assignment);

		changedAssignment.name = "new name";
		changedAssignment.maxPoints = 1000;
		changedAssignment.comment = "new comment";

		return request(app.getHttpServer())
			.patch(`/courses/${course.id}/assignments/${assignment.id}`)
			.send(changedAssignment)
			.expect(({ body }) => {
				expect(body.id).toEqual(assignment.id) // Check if we retrieved the correct assignment
				expect(body.name).toEqual(changedAssignment.name);
				expect(body.maxPoints).toEqual(changedAssignment.maxPoints);
				expect(body.comment).toEqual(changedAssignment.comment);
			})
	});

});

describe('DELETE-REQUESTS of AssignmentController (e2e)', () => {

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

	it.only("(DELETE) /courses/{courseId}/assignments/{assignmentId} Deletes the assignment", () => {
		const assignment = ASSIGNMENT_JAVA_CLOSED;

		return request(app.getHttpServer())
			.delete(`/courses/${course.id}/assignments/${assignment.id}`)
			.expect(200)
	});

});