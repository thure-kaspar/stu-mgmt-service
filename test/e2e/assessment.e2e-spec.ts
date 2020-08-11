import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { AssessmentDto, AssessmentUpdateDto } from "../../src/course/dto/assessment/assessment.dto";
import { createApplication } from "../mocks/application.mock";
import { ASSESSMENT_JAVA_EVALUATED_GROUP_1, ASSESSMENT_JAVA_TESTAT_USER_1, ASSESSMENT_JAVA_IN_REVIEW, ASSESSMENT_JAVA_IN_REVIEW_NO_PARTIALS, AssessmentsMock } from "../mocks/assessments.mock";
import { ASSIGNMENT_JAVA_EVALUATED, ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE, ASSIGNMENT_JAVA_IN_REVIEW_SINGLE } from "../mocks/assignments.mock";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { DbMockService } from "../mocks/db-mock.service";
import { copy } from "../utils/object-helper";
import { PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW, PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW, PARTIAL_ASSESSMENT_MOCK } from "../mocks/partial-assessments.mock";
import { USER_STUDENT_JAVA, USER_STUDENT_3_JAVA_TUTOR } from "../mocks/users.mock";
import { Severity } from "../../src/course/dto/assessment/partial-assessment.dto";
import { GROUP_1_JAVA } from "../mocks/groups/groups.mock";

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

	describe("(GET) /courses/{courseId}/assignments/{assignmentId}/assessments", () => {
	
		it("Retrieves all assessments for the assignment", () => {
			const assignment = ASSIGNMENT_JAVA_EVALUATED;
	
			return request(app.getHttpServer())
				.get(`/courses/${course.id}/assignments/${assignment.id}/assessments`)
				.expect(({ body }) => {
					expect(body.length).toEqual(2);
				});
		});

		it("Retrieves assessment of group for the assignment", () => {
			const assignment = ASSIGNMENT_JAVA_EVALUATED;
			const assessment = ASSESSMENT_JAVA_EVALUATED_GROUP_1;
			console.assert(assignment.id === assessment.assignmentId, "Assessment should belong to assignment.");

			// If we specify groupId, we expect one assessment to be returned
			const queryString = `groupId=${assessment.groupId}`;

			return request(app.getHttpServer())
				.get(`/courses/${course.id}/assignments/${assignment.id}/assessments?${queryString}`)
				.expect(({ body }) => {
					const result = body as AssessmentDto[];
					expect(result.length).toEqual(1);
					expect(result[0].id).toEqual(assessment.id);
					expect(result[0].creator).toBeTruthy();
					expect(result[0].group).toBeTruthy();
				});
		});

		it("Retrieves assessment with username", () => {
			const assignment = ASSIGNMENT_JAVA_IN_REVIEW_SINGLE;
			const assessment = ASSESSMENT_JAVA_IN_REVIEW;
			const user = USER_STUDENT_JAVA;
			console.assert(user.id === assessment.userId, "Should be the same user");
			
			const queryString = `name=${user.username}`;

			return request(app.getHttpServer())
				.get(`/courses/${course.id}/assignments/${assignment.id}/assessments?${queryString}`)
				.expect(({ body }) => {
					const result = body as AssessmentDto[];
					expect(result.length).toEqual(1);
					expect(result[0].id).toEqual(assessment.id);
					expect(result[0].creator).toBeTruthy();
					expect(result[0].user).toBeTruthy();
					expect(result[0].user.username).toEqual(user.username);
				});
		});

		it("Retrieves assessment with groupname", () => {
			const assignment = ASSIGNMENT_JAVA_EVALUATED;
			const assessment = ASSESSMENT_JAVA_EVALUATED_GROUP_1;
			const group = GROUP_1_JAVA;
			console.assert(assignment.id === assessment.assignmentId, "Assessment should belong to assignment.");
			console.assert(assessment.groupId === group.id, "Should be the same group");

			// If we specify groupId, we expect one assessment to be returned
			const queryString = `name=${group.name}`;

			return request(app.getHttpServer())
				.get(`/courses/${course.id}/assignments/${assignment.id}/assessments?${queryString}`)
				.expect(({ body }) => {
					const result = body as AssessmentDto[];
					expect(result.length).toEqual(1);
					expect(result[0].id).toEqual(assessment.id);
					expect(result[0].creator).toBeTruthy();
					expect(result[0].group).toBeTruthy();
					expect(result[0].group.name).toEqual(group.name);
					expect(result[0].group).toBeTruthy();
					expect(result[0].creator).toBeTruthy();
				});
		});

		it("Retrieves assessments with score >= minScore", () => {
			const assignment = ASSIGNMENT_JAVA_EVALUATED;
			const minScore = 50;

			const expectedCount = AssessmentsMock.filter(a => a.achievedPoints >= minScore && a.assignmentId === assignment.id).length;
			console.assert(expectedCount > 0, "There should be at least one assessment with achievedPoints >= minScore");

			const queryString = `minScore=${minScore}`;

			return request(app.getHttpServer())
				.get(`/courses/${course.id}/assignments/${assignment.id}/assessments?${queryString}`)
				.expect(({ body }) => {
					const result = body as AssessmentDto[];
					expect(result.length).toEqual(expectedCount);
				});
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
				expect(result.group).toBeTruthy();
				expect(result.group.members.length).toBeGreaterThanOrEqual(1);
				expect(result.creator).toBeTruthy();
			});
	});

	it("(GET) /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId} Retrieves the (user) assessment", () => {
		const assignment = ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE;
		const assessment = ASSESSMENT_JAVA_TESTAT_USER_1;

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/assignments/${assignment.id}/assessments/${assessment.id}`)
			.expect(({ body }) => {
				const result = body as AssessmentDto;
				expect(result.id).toEqual(assessment.id);
				expect(result.assignmentId).toEqual(assessment.assignmentId);
				expect(result.userId).toEqual(assessment.userId);
				expect(result.user).toBeTruthy();
				expect(result.user.id).toEqual(assessment.userId);
				expect(result.creator).toBeTruthy();
			});
	});

	it("(GET) /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId} Assessment with partial assessments -> Retrieves partials", () => {
		const assignment = copy(ASSIGNMENT_JAVA_IN_REVIEW_SINGLE);
		const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW);
		assessment.partialAssessments = [PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW, PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW];
		assessment.user = USER_STUDENT_JAVA;
		assessment.userId = USER_STUDENT_JAVA.id;
		assessment.creator = USER_STUDENT_3_JAVA_TUTOR;

		const expected = JSON.parse(JSON.stringify(assessment));

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
		await dbMockService.createParticipants();
		await dbMockService.createUserGroupRelations();
		await dbMockService.createAssignments();
		await dbMockService.createAssignmentRegistrations();
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
			.post(`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments`)
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
			.post(`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments`)
			.send(assessment)
			.expect(201)
			.expect(({ body }) => {
				const result = body as AssessmentDto;
				expect(result).toEqual(expected);
			});
	});

	it("(POST) /courses/{courseId}/assignments/{assignmentId}/assessments Assessment with partial assessments -> Creates partial assessments", () => {
		const assignment = copy(ASSIGNMENT_JAVA_IN_REVIEW_SINGLE);
		const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW);
		assessment.partialAssessments = [PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW, PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW];
		const expected = copy(assessment);

		return request(app.getHttpServer())
			.post(`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments`)
			.send(assessment)
			.expect(201)
			.expect(({ body }) => {
				const result = body as AssessmentDto;
				expect(result).toEqual(expected);
			});
	});

	it("(POST) /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId} Adds partial assignment", async () => {
		await dbMockService.createAssessments();
		const assignment = copy(ASSIGNMENT_JAVA_IN_REVIEW_SINGLE);
		const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW);
		const partialAssessment = copy(PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW);
		console.assert(partialAssessment.assessmentId === assessment.id);		
		const expected = copy(partialAssessment);

		return request(app.getHttpServer())
			.post(`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`)
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

	describe("(PATCH) /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId}", () => {

		it("No partial assessments before -> Updates", () => {
			const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW_NO_PARTIALS);

			console.assert(PARTIAL_ASSESSMENT_MOCK.filter(p => p.assessmentId === assessment.id).length == 0, 
				"Assessment should not have partial assessments");
	
			// Create clone of original data and perform some changes
			const changedAssessment: AssessmentUpdateDto = copy(assessment);
			changedAssessment.achievedPoints = 99;
			changedAssessment.comment = "new comment";
	
			return request(app.getHttpServer())
				.patch(`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`)
				.send(changedAssessment)
				.expect(200)
				.expect(({ body }) => {
					expect(body.id).toEqual(assessment.id); // Check if we retrieved the correct assessments
					expect(body.achievedPoints).toEqual(changedAssessment.achievedPoints);
					expect(body.comment).toEqual(changedAssessment.comment);
				});
		});

		it("No partials before -> Add partial -> Partials added", () => {
			const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW_NO_PARTIALS);

			console.assert(PARTIAL_ASSESSMENT_MOCK.filter(p => p.assessmentId === assessment.id).length == 0, 
				"Assessment should not have partial assessments");

			const update: AssessmentUpdateDto = {
				addPartialAssessments: [
					{
						assessmentId: assessment.id,
						title: "Added partial assessment #1",
						comment: "A comment...",
						points: 11,
						severity: Severity.INFORMATIONAL,
						type: "???",
					},
					{
						assessmentId: assessment.id,
						title: "Added partial assessment #2",
						comment: "A comment...",
						points: 22,
						severity: Severity.WARNING,
						type: "???",
					}
				]
			};

			const tmp = copy(assessment);
			// Joined relations
			tmp.creator = USER_STUDENT_3_JAVA_TUTOR;
			tmp.user = USER_STUDENT_3_JAVA_TUTOR;
			tmp.partialAssessments = update.addPartialAssessments; // Add new partials
			const expected = JSON.parse(JSON.stringify(tmp)); // Avoids issues with date types

			return request(app.getHttpServer())
				.patch(`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`)
				.send(update)
				.expect(200)
				.expect(({ body }) => {
					const result = body as AssessmentDto;
					expect(result.partialAssessments[0].id).toBeDefined();
					result.partialAssessments.forEach(p => p.id = undefined); // Remove ids for easier comparison
					expect(result).toEqual(expected);
				});
		});

		it("Partials before -> Update partial -> Partial updated", () => {
			const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW);
			assessment.partialAssessments = PARTIAL_ASSESSMENT_MOCK.filter(p => p.assessmentId === assessment.id);
			console.assert(assessment.partialAssessments.length > 1, "Assessment should have multiple partial assessments.");

			// Update partial
			assessment.partialAssessments[0].title = "Updated title";
			assessment.partialAssessments[0].points = 42;

			const update: AssessmentUpdateDto = {
				updatePartialAssignments: [copy(assessment.partialAssessments[0])]
			};
			
			const tmp = copy(assessment);
			// Joined relations
			tmp.creator = USER_STUDENT_3_JAVA_TUTOR;
			tmp.user = USER_STUDENT_JAVA;

			const expected = JSON.parse(JSON.stringify(tmp)); // Avoids issues with date types

			return request(app.getHttpServer())
				.patch(`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`)
				.send(update)
				.expect(200)
				.expect(({ body }) => {
					const result = body as AssessmentDto;
					expect(result).toEqual(expected);
				});
		});

		it("Partials before -> Remove partial -> Partials removed", () => {
			const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW);
			assessment.partialAssessments = PARTIAL_ASSESSMENT_MOCK.filter(p => p.assessmentId === assessment.id);
			console.assert(assessment.partialAssessments.length > 1, "Assessment should have multiple partial assessments.");

			// Remove partial (by only taking first one)
			const update: AssessmentUpdateDto = {
				removePartialAssignments: assessment.partialAssessments.splice(1) // Take everything but the first partial
			};
			assessment.partialAssessments = [assessment.partialAssessments[0]]; // Only take the first partial
			
			const tmp = copy(assessment);
			// Joined relations
			tmp.creator = USER_STUDENT_3_JAVA_TUTOR;
			tmp.user = USER_STUDENT_JAVA;

			const expected = JSON.parse(JSON.stringify(tmp)); // Avoids issues with date types

			return request(app.getHttpServer())
				.patch(`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`)
				.send(update)
				.expect(200)
				.expect(({ body }) => {
					const result = body as AssessmentDto;
					expect(result).toEqual(expected);
				});
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
