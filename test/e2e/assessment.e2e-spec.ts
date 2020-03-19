import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { AssessmentDto } from "../../src/shared/dto/assessment.dto";
import { createApplication } from "../mocks/application.mock";
import { ASSESSMENT_JAVA_EVALUATED_GROUP_1, ASSESSMENT_JAVA_TESTAT_USER_1 } from "../mocks/assessments.mock";
import { ASSIGNMENT_JAVA_EVALUATED, ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE } from "../mocks/assignments.mock";
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

	it("(GET) /courses/{courseId}/assignments/{assignmentId}/assessments Retrieves all assessments for the assignment", () => {
		const assignment = ASSIGNMENT_JAVA_EVALUATED;

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/assignments/${assignment.id}/assessments`)
			.expect(({ body }) => {
				expect(body.length).toEqual(2);
			});
	});

	it("(GET) /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId} Retrieves the (group) assessment", () => {
		const assignment = ASSIGNMENT_JAVA_EVALUATED;
		const assessment = ASSESSMENT_JAVA_EVALUATED_GROUP_1;

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/assignments/${assignment.id}/assessments/${assessment.id}`)
			.expect(({ body }) => {
				const result = body as AssessmentDto;
				expect(result.id).toEqual(assessment.id);
				expect(result.assignmentId).toEqual(assessment.assignmentId);
				expect(result.groupId).toEqual(assessment.groupId);
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
		await dbMockService.createCourseUserRelations();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /courses/{courseId}/assignments/{assignmentId}/assessments Creates the given (group-)assessment and returns it", async () => {
		// Setup
		await dbMockService.createGroups();
		await dbMockService.createUserGroupRelations();
		await dbMockService.createAssignments();
		const assignment = ASSIGNMENT_JAVA_EVALUATED;
		const assessment = ASSESSMENT_JAVA_EVALUATED_GROUP_1;

		return request(app.getHttpServer())
			.post(`/courses/${assignment.courseId}/assignments/${assessment.assignmentId}/assessments`)
			.send(assessment)
			.expect(201)
			.expect(({ body }) => {
				const result = body as AssessmentDto;
				expect(result.assignmentId).toEqual(assessment.assignmentId);
				expect(result.groupId).toEqual(assessment.groupId);
				expect(result.achievedPoints).toEqual(assessment.achievedPoints);
				expect(result.comment).toEqual(assessment.comment);
			});
	});

	it("(POST) /courses/{courseId}/assignments/{assignmentId}/assessments Creates the given (user-)assessment and returns it", async () => {
		// Setup
		await dbMockService.createAssignments();
		const assignment = ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE;
		const assessment = ASSESSMENT_JAVA_TESTAT_USER_1;

		return request(app.getHttpServer())
			.post(`/courses/${assignment.courseId}/assignments/${assessment.assignmentId}/assessments`)
			.send(assessment)
			.expect(201)
			.expect(({ body }) => {
				expect(body.assignmentId).toEqual(assessment.assignmentId);
				expect(body.achievedPoints).toEqual(assessment.achievedPoints);
				expect(body.comment).toEqual(assessment.comment);
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

	it("(PATCH) /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId} Updates the assessment)", () => {
		const assessment = ASSESSMENT_JAVA_EVALUATED_GROUP_1;

		// Create clone of original data and perform some changes
		const changedAssessment = new AssessmentDto();
		Object.assign(changedAssessment, assessment);

		changedAssessment.achievedPoints = 99;
		changedAssessment.comment = "new comment";

		return request(app.getHttpServer())
			.patch(`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`)
			.send(changedAssessment)
			.expect(({ body }) => {
				expect(body.id).toEqual(assessment.id); // Check if we retrieved the correct assessments
				expect(body.achievedPoints).toEqual(changedAssessment.achievedPoints);
				expect(body.comment).toEqual(changedAssessment.comment);
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

	it("(DELETE) /courses/{courseId}/assignments/{assignmentId}/assessment/{assessmentId} Deletes the assessment", () => {
		const assignment = ASSIGNMENT_JAVA_EVALUATED;
		const assessment = ASSESSMENT_JAVA_EVALUATED_GROUP_1;

		return request(app.getHttpServer())
			.delete(`/courses/${course.id}/assignments/${assignment.id}/assessments/${assessment.id}`)
			.expect(200);
	});

});
