import { AssessmentAllocationDto } from "../../src/assessment/dto/assessment-allocation.dto";
import {
	ASSESSMENT_ALLOCATIONS_MOCK,
	ASSESSMENT_ALLOCATION_1_ASSIGNMENT_JAVA_IN_REVIEW
} from "../mocks/assessment-allocation.mock";
import {
	ASSIGNMENT_JAVA2020_GROUP,
	ASSIGNMENT_JAVA_CLOSED,
	ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP,
	ASSIGNMENT_JAVA_IN_REVIEW_SINGLE
} from "../mocks/assignments.mock";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { GROUP_4_JAVA } from "../mocks/groups/groups.mock";
import { USER_MGMT_ADMIN_JAVA_LECTURER, USER_STUDENT_2_JAVA } from "../mocks/users.mock";
import { TestSetup } from "../utils/e2e";
import { copy } from "../utils/object-helper";

const course = COURSE_JAVA_1920;
const assignment = ASSIGNMENT_JAVA_IN_REVIEW_SINGLE;

describe("AssessmentAllocation E2E", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("POST-REQUESTS of AssessmentController (e2e)", () => {
		beforeEach(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("(POST) courses/:courseId/assignments/:assignmentId/assessment-allocation", () => {
			it("Already assigned to different evaluator -> Changes the evaluator", () => {
				// Change assigned evaluator of existing allocation
				const allocation = copy(ASSESSMENT_ALLOCATION_1_ASSIGNMENT_JAVA_IN_REVIEW);
				console.assert(
					USER_MGMT_ADMIN_JAVA_LECTURER.id !== allocation.assignedEvaluatorId,
					"Assigned evaluator should change."
				);
				allocation.assignedEvaluatorId = USER_MGMT_ADMIN_JAVA_LECTURER.id;

				return setup
					.request()
					.post(
						`/courses/${course.id}/assignments/${assignment.id}/assessment-allocations`
					)
					.send(allocation)
					.expect(201)
					.expect(({ body }) => {
						const result = body as AssessmentAllocationDto;
						expect(result).toEqual(allocation);
					});
			});

			describe("Allocation does not exists -> Create the allocation", () => {
				it("For group", () => {
					const allocation = copy(ASSESSMENT_ALLOCATION_1_ASSIGNMENT_JAVA_IN_REVIEW);
					allocation.groupId = GROUP_4_JAVA.id;

					return setup
						.request()
						.post(
							`/courses/${course.id}/assignments/${assignment.id}/assessment-allocations`
						)
						.send(allocation)
						.expect(201)
						.expect(({ body }) => {
							const result = body as AssessmentAllocationDto;
							expect(result).toEqual(allocation);
						});
				});

				it("For user", () => {
					const allocation = copy(ASSESSMENT_ALLOCATION_1_ASSIGNMENT_JAVA_IN_REVIEW);
					allocation.groupId = undefined;
					allocation.userId = USER_STUDENT_2_JAVA.id;

					return setup
						.request()
						.post(
							`/courses/${course.id}/assignments/${assignment.id}/assessment-allocations`
						)
						.send(allocation)
						.expect(201)
						.expect(({ body }) => {
							const result = body as AssessmentAllocationDto;
							expect(result).toEqual(allocation);
						});
				});
			});

			describe("Invalid Dto", () => {
				it("Wrong assignmentId -> Throws error", () => {
					const invalidAllocation = copy(
						ASSESSMENT_ALLOCATION_1_ASSIGNMENT_JAVA_IN_REVIEW
					);
					console.assert(
						invalidAllocation.assignmentId !== ASSIGNMENT_JAVA_CLOSED.id,
						"Assignment ids should be different before the change."
					);
					invalidAllocation.assignmentId = ASSIGNMENT_JAVA_CLOSED.id;

					return setup
						.request()
						.post(
							`/courses/${course.id}/assignments/${assignment.id}/assessment-allocations`
						)
						.send(invalidAllocation)
						.expect(400);
				});

				it("No groupId or userid -> Throws error", () => {
					const invalidAllocation = copy(
						ASSESSMENT_ALLOCATION_1_ASSIGNMENT_JAVA_IN_REVIEW
					);
					invalidAllocation.groupId = undefined;
					invalidAllocation.userId = undefined;

					return setup
						.request()
						.post(
							`/courses/${course.id}/assignments/${assignment.id}/assessment-allocations`
						)
						.send(invalidAllocation)
						.expect(400);
				});
			});
		});

		describe("(POST) courses/:courseId/assignments/:assignmentId/assessment-allocation/from-existing/:existingAssignmentId", () => {
			it("Existing assignment has allocations -> Creates allocations for new assignment", () => {
				const newAssignment = ASSIGNMENT_JAVA2020_GROUP;
				const existingAssignment = assignment;
				console.assert(
					newAssignment.id !== existingAssignment.id,
					"Assignments should be different."
				);

				// Expect same data with new assignment id
				const expected = copy(ASSESSMENT_ALLOCATIONS_MOCK).filter(
					a => a.assignmentId === existingAssignment.id
				);
				expected.forEach(a => (a.assignmentId = newAssignment.id));
				console.assert(
					expected.length > 1,
					"Database should contain multipe assessment allocations."
				);

				return setup
					.request()
					.post(
						`/courses/${course.id}/assignments/${newAssignment.id}/assessment-allocations/from-existing/${existingAssignment.id}`
					)
					.expect(201)
					.expect(({ body }) => {
						const result = body as AssessmentAllocationDto[];
						expect(result).toEqual(expected);
					});
			});

			it("Existing assignment has no allocations -> Returns empty array", () => {
				const newAssignment = ASSIGNMENT_JAVA2020_GROUP;
				const existingAssignment = ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP;
				console.assert(
					ASSESSMENT_ALLOCATIONS_MOCK.filter(
						a => a.assignmentId === existingAssignment.id
					).length == 0,
					"There should be no allocations for this assignment."
				);

				return setup
					.request()
					.post(
						`/courses/${course.id}/assignments/${newAssignment.id}/assessment-allocations/from-existing/${existingAssignment.id}`
					)
					.expect(201)
					.expect(({ body }) => {
						const result = body as AssessmentAllocationDto[];
						expect(result.length).toEqual(0);
					});
			});
		});
	});

	describe("GET-REQUESTS of AssessmentController (e2e)", () => {
		beforeAll(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("(GET) courses/:courseId/assignments/:assignmentId/assessment-allocation", () => {
			it("Retrieves the allocations for an assignment", () => {
				const expected = ASSESSMENT_ALLOCATIONS_MOCK.filter(
					a => a.assignmentId === assignment.id
				);
				console.assert(
					expected.length > 1,
					"Testdata should contain multiple allocations for this assigment."
				);

				return setup
					.request()
					.get(
						`/courses/${course.id}/assignments/${assignment.id}/assessment-allocations`
					)
					.expect(200)
					.expect(({ body }) => {
						const result = body as AssessmentAllocationDto[];
						expect(result).toEqual(expected);
					});
			});
		});
	});

	describe("DELETE-REQUESTS of AssessmentController (e2e)", () => {
		beforeEach(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("(DELETE) courses/:courseId/assignments/:assignmentId/assessment-allocation", () => {
			it("Removes the Allocation", () => {
				const allocationToRemove = ASSESSMENT_ALLOCATION_1_ASSIGNMENT_JAVA_IN_REVIEW;
				console.assert(
					!!allocationToRemove.groupId,
					"Allocation should have a defined groupId"
				);

				return setup
					.request()
					.delete(
						`/courses/${course.id}/assignments/${assignment.id}/assessment-allocations?groupId=${allocationToRemove.groupId}`
					)
					.expect(200);
			});
		});
	});
});
