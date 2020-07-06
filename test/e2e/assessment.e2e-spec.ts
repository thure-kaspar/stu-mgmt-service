import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { AssessmentDto } from "../../src/course/dto/assessment/assessment.dto";
import { createApplication } from "../mocks/application.mock";
import { ASSESSMENT_JAVA_EVALUATED_GROUP_1, ASSESSMENT_JAVA_TESTAT_USER_1, ASSESSMENT_JAVA_IN_REVIEW } from "../mocks/assessments.mock";
import { ASSIGNMENT_JAVA_EVALUATED, ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE, ASSIGNMENT_JAVA_IN_REVIEW } from "../mocks/assignments.mock";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { DbMockService } from "../mocks/db-mock.service";
import { copy } from "../utils/object-helper";
import { PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW, PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW } from "../mocks/partial-assessments.mock";
import { USER_STUDENT_JAVA } from "../mocks/users.mock";

let app: INestApplication;
let dbMockService: DbMockService;

const course = COURSE_JAVA_1920; // the course that will be used for testing

describe("GET-REQUESTS of AssessmentController (e2e)", () => {

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

	it("(GET) /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId} Assessment with partial assessments -> Retrieves partials", () => {
		const assignment = copy(ASSIGNMENT_JAVA_IN_REVIEW);
		const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW);
		assessment.partialAssessments = [PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW, PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW];
		assessment.user = USER_STUDENT_JAVA;
		assessment.userId = USER_STUDENT_JAVA.id;
		const expected = (assessment);

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/assignments/${assignment.id}/assessments/${assessment.id}`)
			.expect(({ body }) => {
				const result = body as AssessmentDto;
				expect(result).toEqual(expected);
			});
	});

});

describe("POST-REQUESTS of AssessmentController (e2e)", () => {

	beforeEach(async () => {
		app = await createApplication();

		// Setup mocks
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createCourses();
		await dbMockService.createUsers();
		await dbMockService.createGroups();
		await dbMockService.createCourseUserRelations();
		await dbMockService.createUserGroupRelations();
		await dbMockService.createAssignments();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /courses/{courseId}/assignments/{assignmentId}/assessments Creates the given (group-)assessment and returns it", () => {
		const assignment = copy(ASSIGNMENT_JAVA_EVALUATED);
		const assessment = copy(ASSESSMENT_JAVA_EVALUATED_GROUP_1);

		const expected = copy(assessment);

		return request(app.getHttpServer())
			.post(`/courses/${assignment.courseId}/assignments/${assessment.assignmentId}/assessments`)
			.send(assessment)
			.expect(201)
			.expect(({ body }) => {
				const result = body as AssessmentDto;
				expect(result).toEqual(expected);
			});
	});

	it("(POST) /courses/{courseId}/assignments/{assignmentId}/assessments Creates the given (user-)assessment and returns it", () => {
		const assignment = copy(ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE);
		const assessment = copy(ASSESSMENT_JAVA_TESTAT_USER_1);

		const expected = copy(assessment);

		return request(app.getHttpServer())
			.post(`/courses/${assignment.courseId}/assignments/${assessment.assignmentId}/assessments`)
			.send(assessment)
			.expect(201)
			.expect(({ body }) => {
				const result = body as AssessmentDto;
				expect(result).toEqual(expected);
			});
	});

	it("(POST) /courses/{courseId}/assignments/{assignmentId}/assessments Assessment with partial assessments -> Creates partial assessments", () => {
		const assignment = copy(ASSIGNMENT_JAVA_IN_REVIEW);
		const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW);
		assessment.partialAssessments = [PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW, PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW];
		const expected = copy(assessment);

		return request(app.getHttpServer())
			.post(`/courses/${assignment.courseId}/assignments/${assessment.assignmentId}/assessments`)
			.send(assessment)
			.expect(201)
			.expect(({ body }) => {
				const result = body as AssessmentDto;
				expect(result).toEqual(expected);
			});
	});

	it("(POST) /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId} Adds partial assignment", async () => {
		await dbMockService.createAssessments();
		const assignment = copy(ASSIGNMENT_JAVA_IN_REVIEW);
		const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW);
		const partialAssessment = copy(PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW);
		console.assert(partialAssessment.assessmentId === assessment.id);		
		const expected = copy(partialAssessment);

		return request(app.getHttpServer())
			.post(`/courses/${assignment.courseId}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`)
			.send(partialAssessment)
			.expect(201)
			.expect(({ body }) => {
				const result = body as AssessmentDto;
				expect(result).toEqual(expected);
			});
	});

});

describe("PATCH-REQUESTS of AssessmentController (e2e)", () => {

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

	it("(PATCH) /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId} Updates the assessment", () => {
		const assessment = ASSESSMENT_JAVA_EVALUATED_GROUP_1;

		// Create clone of original data and perform some changes
		const changedAssessment = copy(assessment);
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

describe("DELETE-REQUESTS of AssessmentController (e2e)", () => {

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
