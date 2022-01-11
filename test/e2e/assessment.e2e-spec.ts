import { AssessmentDto, AssessmentUpdateDto } from "../../src/assessment/dto/assessment.dto";
import { PartialAssessmentDto } from "../../src/assessment/dto/partial-assessment.dto";
import {
	AssessmentsMock,
	ASSESSMENT_JAVA_EVALUATED_GROUP_1,
	ASSESSMENT_JAVA_IN_REVIEW,
	ASSESSMENT_JAVA_IN_REVIEW_GROUP_PARTIALS,
	ASSESSMENT_JAVA_IN_REVIEW_NO_PARTIALS,
	ASSESSMENT_JAVA_TESTAT_USER_1
} from "../mocks/assessments.mock";
import {
	ASSIGNMENT_JAVA_EVALUATED,
	ASSIGNMENT_JAVA_IN_REVIEW_SINGLE,
	ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE
} from "../mocks/assignments.mock";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { GROUP_1_JAVA } from "../mocks/groups/groups.mock";
import {
	PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW,
	PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW,
	PARTIAL_ASSESSMENT_JAVA_IN_REVIEW_GROUP_MARKERS,
	PARTIAL_ASSESSMENT_MOCK
} from "../mocks/partial-assessments.mock";
import { USER_MGMT_ADMIN_JAVA_LECTURER, USER_STUDENT_JAVA } from "../mocks/users.mock";
import { TestSetup } from "../utils/e2e";
import { copy } from "../utils/object-helper";

const course = COURSE_JAVA_1920; // the course that will be used for testing
describe("Assessment E2E", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("GET-REQUESTS of AssessmentController (e2e)", () => {
		beforeAll(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("(GET) /courses/{courseId}/assignments/{assignmentId}/assessments", () => {
			it("Retrieves all assessments for the assignment", () => {
				const assignment = ASSIGNMENT_JAVA_EVALUATED;

				return setup
					.request()
					.get(`/courses/${course.id}/assignments/${assignment.id}/assessments`)
					.expect(({ body }) => {
						expect(body.length).toEqual(2);
					});
			});

			it("Retrieves assessment of group for the assignment", () => {
				const assignment = ASSIGNMENT_JAVA_EVALUATED;
				const assessment = ASSESSMENT_JAVA_EVALUATED_GROUP_1;
				console.assert(
					assignment.id === assessment.assignmentId,
					"Assessment should belong to assignment."
				);

				// If we specify groupId, we expect one assessment to be returned
				const queryString = `groupId=${assessment.groupId}`;

				return setup
					.request()
					.get(
						`/courses/${course.id}/assignments/${assignment.id}/assessments?${queryString}`
					)
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

				return setup
					.request()
					.get(
						`/courses/${course.id}/assignments/${assignment.id}/assessments?${queryString}`
					)
					.expect(({ body }) => {
						const result = body as AssessmentDto[];
						expect(result.length).toEqual(1);
						expect(result[0].id).toEqual(assessment.id);
						expect(result[0].creator).toBeTruthy();
						expect(result[0].participant).toBeTruthy();
						expect(result[0].participant.username).toEqual(user.username);
					});
			});

			it("Retrieves assessment with groupname", () => {
				const assignment = ASSIGNMENT_JAVA_EVALUATED;
				const assessment = ASSESSMENT_JAVA_EVALUATED_GROUP_1;
				const group = GROUP_1_JAVA;
				console.assert(
					assignment.id === assessment.assignmentId,
					"Assessment should belong to assignment."
				);
				console.assert(assessment.groupId === group.id, "Should be the same group");

				// If we specify groupId, we expect one assessment to be returned
				const queryString = `name=${group.name}`;

				return setup
					.request()
					.get(
						`/courses/${course.id}/assignments/${assignment.id}/assessments?${queryString}`
					)
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

				const expectedCount = AssessmentsMock.filter(
					a => a.achievedPoints >= minScore && a.assignmentId === assignment.id
				).length;
				console.assert(
					expectedCount > 0,
					"There should be at least one assessment with achievedPoints >= minScore"
				);

				const queryString = `minScore=${minScore}`;

				return setup
					.request()
					.get(
						`/courses/${course.id}/assignments/${assignment.id}/assessments?${queryString}`
					)
					.expect(({ body }) => {
						const result = body as AssessmentDto[];
						expect(result.length).toEqual(expectedCount);
					});
			});
		});

		it("(GET) /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId} Retrieves the (group) assessment", () => {
			const assignment = ASSIGNMENT_JAVA_EVALUATED;
			const assessment = ASSESSMENT_JAVA_EVALUATED_GROUP_1;

			return setup
				.request()
				.get(
					`/courses/${course.id}/assignments/${assignment.id}/assessments/${assessment.id}`
				)
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

			return setup
				.request()
				.get(
					`/courses/${course.id}/assignments/${assignment.id}/assessments/${assessment.id}`
				)
				.expect(({ body }) => {
					const result = body as AssessmentDto;
					expect(result.id).toEqual(assessment.id);
					expect(result.assignmentId).toEqual(assessment.assignmentId);
					expect(result.userId).toEqual(assessment.userId);
					expect(result.participant).toBeTruthy();
					expect(result.participant.userId).toEqual(assessment.userId);
					expect(result.creator).toBeTruthy();
				});
		});

		it("(GET) /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId} Assessment with partial assessments -> Retrieves partials", () => {
			const assignment = copy(ASSIGNMENT_JAVA_IN_REVIEW_SINGLE);
			const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW);

			return setup
				.request()
				.get(
					`/courses/${course.id}/assignments/${assignment.id}/assessments/${assessment.id}`
				)
				.expect(({ body }) => {
					const result = body as AssessmentDto;
					result.creationDate = null;
					result.updateDate = null;
					expect(result).toMatchSnapshot();
				});
		});
	});

	describe("POST-REQUESTS of AssessmentController (e2e)", () => {
		beforeEach(async () => {
			await setup.clearDb();
			await setup.dbMockService.createCourses();
			await setup.dbMockService.createUsers();
			await setup.dbMockService.createParticipants();
			await setup.dbMockService.createGroups();
			await setup.dbMockService.createAssignments();
			await setup.dbMockService.createAssignmentRegistrations();
		});

		it("(POST) /courses/{courseId}/assignments/{assignmentId}/assessments Creates the given (group-)assessment and returns it", () => {
			const assessment = copy(ASSESSMENT_JAVA_EVALUATED_GROUP_1);
			assessment.id = undefined;

			const expected = copy(assessment);
			expected.updateDate = undefined;
			expected.creationDate = undefined;
			expected.creatorId = USER_MGMT_ADMIN_JAVA_LECTURER.id;

			return setup
				.request()
				.post(`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments`)
				.send(assessment)
				.expect(201)
				.expect(({ body }) => {
					const result = body as AssessmentDto;
					expect(result.id).toBeDefined();
					expect(result.updateDate).toBeDefined();
					expect(result.creationDate).toBeDefined();
					result.id = undefined;
					result.updateDate = undefined;
					result.creationDate = undefined;
					expect(result).toMatchSnapshot();
				});
		});

		it("(POST) /courses/{courseId}/assignments/{assignmentId}/assessments Creates the given (user-)assessment and returns it", () => {
			const assessment = copy(ASSESSMENT_JAVA_TESTAT_USER_1);
			assessment.id = undefined;

			const expected = copy(assessment);
			expected.updateDate = undefined;
			expected.creationDate = undefined;
			expected.creatorId = USER_MGMT_ADMIN_JAVA_LECTURER.id;

			return setup
				.request()
				.post(`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments`)
				.send(assessment)
				.expect(201)
				.expect(({ body }) => {
					const result = body as AssessmentDto;
					expect(result.id).toBeDefined();
					expect(result.updateDate).toBeDefined();
					expect(result.creationDate).toBeDefined();
					result.id = undefined;
					result.updateDate = undefined;
					result.creationDate = undefined;
					expect(result).toMatchSnapshot();
				});
		});

		it("(POST) /courses/{courseId}/assignments/{assignmentId}/assessments Assessment with partial assessments -> Creates partial assessments", () => {
			const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW);
			assessment.id = undefined;
			assessment.partialAssessments = [
				PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW,
				PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW
			];

			const expected = copy(assessment);
			expected.updateDate = undefined;
			expected.creationDate = undefined;
			expected.creatorId = USER_MGMT_ADMIN_JAVA_LECTURER.id;

			return setup
				.request()
				.post(`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments`)
				.send(assessment)
				.expect(201)
				.expect(({ body }) => {
					const result = body as AssessmentDto;
					expect(result.id).toBeDefined();
					expect(result.updateDate).toBeDefined();
					expect(result.creationDate).toBeDefined();
					result.id = undefined;
					result.updateDate = undefined;
					result.creationDate = undefined;
					expect(result).toMatchSnapshot();
				});
		});

		it("(POST) /courses/{courseId}/assignments/{assignmentId}/assessments Assessment with partial assessments (NO key) -> Creates partial assessments with random keys", () => {
			const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW);
			assessment.id = undefined;

			const partial1 = copy(PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW);
			const partial2 = copy(PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW);
			partial1.key = undefined;
			partial2.key = undefined;

			assessment.partialAssessments = [partial1, partial2];

			const expected = copy(assessment);
			expected.updateDate = undefined;
			expected.creationDate = undefined;
			expected.creatorId = USER_MGMT_ADMIN_JAVA_LECTURER.id;

			return setup
				.request()
				.post(`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments`)
				.send(assessment)
				.expect(201)
				.expect(({ body }) => {
					const result = body as AssessmentDto;
					expect(result.partialAssessments[0].key).toBeDefined();
					expect(result.partialAssessments[1].key).toBeDefined();
				});
		});

		it("(POST) /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId} Sets partial assignment", async () => {
			await setup.dbMockService.createAssessments();
			const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW);
			const partialAssessment = copy(PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW);

			return setup
				.request()
				.put(
					`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`
				)
				.send(partialAssessment)
				.expect(200)
				.expect(({ body }) => {
					const result = body as PartialAssessmentDto;
					expect(result).toEqual(partialAssessment);
				});
		});
	});

	describe("PATCH-REQUESTS of AssessmentController (e2e)", () => {
		beforeEach(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("(PATCH) /courses/{courseId}/assignments/{assignmentId}/assessments/{assessmentId}", () => {
			it("Allows score to be set to 0", () => {
				const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW_NO_PARTIALS);

				// Create clone of original data and perform some changes
				const changedAssessment: AssessmentUpdateDto = copy(assessment);
				changedAssessment.achievedPoints = 0;

				return setup
					.request()
					.patch(
						`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`
					)
					.send(changedAssessment)
					.expect(200)
					.expect(({ body }) => {
						expect(body.id).toEqual(assessment.id); // Check if we retrieved the correct assessments
						expect(body.achievedPoints).toEqual(changedAssessment.achievedPoints);
					});
			});

			it("Changes assessment from draft to non-draft", () => {
				const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW_NO_PARTIALS);
				console.assert(assessment.isDraft, "Assessment should be marked as draft.");

				// Create clone of original data and perform some changes
				const changedAssessment: AssessmentUpdateDto = copy(assessment);
				changedAssessment.isDraft = false;

				return setup
					.request()
					.patch(
						`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`
					)
					.send(changedAssessment)
					.expect(200)
					.expect(({ body }) => {
						const result = body as AssessmentDto;
						expect(result.id).toEqual(assessment.id);
						expect(result.isDraft).toEqual(changedAssessment.isDraft);
					});
			});

			it("No partial assessments before -> Adds partial assessments", () => {
				const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW_NO_PARTIALS);

				console.assert(
					PARTIAL_ASSESSMENT_MOCK.filter(p => p.assessmentId === assessment.id).length ==
						0,
					"Assessment should not have partial assessments"
				);

				// Create clone of original data and perform some changes
				const changedAssessment: AssessmentUpdateDto = copy(assessment);
				changedAssessment.achievedPoints = 99;
				changedAssessment.comment = "new comment";
				changedAssessment.partialAssessments = [
					PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW,
					PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW
				];

				return setup
					.request()
					.patch(
						`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`
					)
					.send(changedAssessment)
					.expect(200)
					.expect(({ body }) => {
						const result = body as AssessmentDto;
						result.creationDate = null;
						result.updateDate = null;
						expect(result).toMatchSnapshot();
					});
			});

			it("Partial assessments before -> Updates partial assessments", () => {
				const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW_GROUP_PARTIALS);

				console.assert(
					PARTIAL_ASSESSMENT_MOCK.filter(p => p.assessmentId === assessment.id).length >
						0,
					"Assessment should have partial assessments"
				);

				const updatedPartial = copy(PARTIAL_ASSESSMENT_JAVA_IN_REVIEW_GROUP_MARKERS);
				updatedPartial.title = "Updated title";
				updatedPartial.comment = "Updated comment";
				updatedPartial.points = null;

				// Create clone of original data and perform some changes
				const changedAssessment: AssessmentUpdateDto = {
					partialAssessments: [updatedPartial]
				};

				return setup
					.request()
					.patch(
						`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`
					)
					.send(changedAssessment)
					.expect(200)
					.expect(({ body }) => {
						const result = body as AssessmentDto;
						result.creationDate = null;
						result.updateDate = null;
						expect(result).toMatchSnapshot();
					});
			});

			it("Removing key from partial assessment -> Generates random key", () => {
				const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW_GROUP_PARTIALS);

				console.assert(
					PARTIAL_ASSESSMENT_MOCK.filter(p => p.assessmentId === assessment.id).length >
						0,
					"Assessment should have partial assessments"
				);

				const updatedPartial = copy(PARTIAL_ASSESSMENT_JAVA_IN_REVIEW_GROUP_MARKERS);
				updatedPartial.key = undefined;

				const changedAssessment: AssessmentUpdateDto = {
					partialAssessments: [updatedPartial]
				};

				return setup
					.request()
					.patch(
						`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`
					)
					.send(changedAssessment)
					.expect(200)
					.expect(({ body }) => {
						const result = body as AssessmentDto;
						expect(result.partialAssessments).toHaveLength(1);
						expect(result.partialAssessments[0]).toBeDefined();
					});
			});

			it("Partial assessments before -> Remove partial assessments", () => {
				const assessment = copy(ASSESSMENT_JAVA_IN_REVIEW_GROUP_PARTIALS);

				console.assert(
					PARTIAL_ASSESSMENT_MOCK.filter(p => p.assessmentId === assessment.id).length >
						0,
					"Assessment should have partial assessments"
				);

				// Create clone of original data and perform some changes
				const changedAssessment: AssessmentUpdateDto = {
					partialAssessments: []
				};

				return setup
					.request()
					.patch(
						`/courses/${course.id}/assignments/${assessment.assignmentId}/assessments/${assessment.id}`
					)
					.send(changedAssessment)
					.expect(200)
					.expect(({ body }) => {
						const result = body as AssessmentDto;
						result.creationDate = null;
						result.updateDate = null;
						expect(result).toMatchSnapshot();
					});
			});
		});
	});

	describe("DELETE-REQUESTS of AssessmentController (e2e)", () => {
		beforeEach(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		it("(DELETE) /courses/{courseId}/assignments/{assignmentId}/assessment/{assessmentId} Deletes the assessment", () => {
			const assignment = ASSIGNMENT_JAVA_EVALUATED;
			const assessment = ASSESSMENT_JAVA_EVALUATED_GROUP_1;

			return setup
				.request()
				.delete(
					`/courses/${course.id}/assignments/${assignment.id}/assessments/${assessment.id}`
				)
				.expect(200);
		});
	});
});
