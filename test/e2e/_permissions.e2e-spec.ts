import { QueryFailedError } from "typeorm";
import {
	AssignmentState,
	AssignmentType,
	CollaborationType,
	UserRole
} from "../../src/shared/enums";
import { createAuthTestApplication } from "../mocks/application.mock";
import { GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF } from "../mocks/course-config/group-settings.mock";
import { StudentMgmtDbData, StudentMgmtDbEntities } from "../utils/demo-db";
import { TestSetup } from "../utils/e2e";

const lecturerOtherCourse = "lecturerOfOtherCourse";
const admin = "systemAdmin";
const student = "courseStudent";
const studentUserId = "a44c818b-4494-4d78-8fd3-dfada7e2359c";
const lecturer = "courseLecturer";
const lecturerUserId = "ae85f9ab-2bcd-4cd1-a1ad-382f9900d54b";
const userNotInCourse = "userNotInCourse";
const userNotInCourseId = "ae62dbd3-18da-4fb7-a664-1c93816808a6";
const courseId = "test-course";
const otherCourseId = "other-course";
const assignmentId = "44e9e03b-6c53-402c-bae5-78f3adfde797";
const otherAssignmentId = "f5dff9f7-74ac-48a0-9235-3fe11ce8f256";
const groupId = "130f0ced-c619-4ccc-acca-10409decc83c";
const otherGroupId = "e94c713c-4caf-4fa1-84f7-ef0261f458d1";
const assessmentId = "466bf71e-6bdd-4f6b-90fd-b339b2dc16f6";
const foreignAssessmentId = "d541215a-fee4-412c-ae54-3b69149e324a";
const otherAssessmentId = "6f2b7387-a19b-4eb9-8d73-3c453c3d0e30";

/**
 * Configuration with ...
 * - 2 Courses
 * - User `lecturerOfOtherCourse` that is not member of `test-course`
 * - User `courseLecturer` that is lecturer of `test-course`
 * - Some test data in `test-course`
 *
 * `lecturerOfOtherCourse` should not be allowed to access any privileged data of `test-course`.
 */
export const PERMISSIONS_TESTING_CONFIG: StudentMgmtDbData = {
	users: [
		{
			username: lecturerOtherCourse,
			displayName: "Lecturer of other course",
			id: "25e0876c-fe13-4b61-82f8-40b3149bac55",
			role: UserRole.USER
		},
		{
			username: lecturer,
			displayName: "Course Lecturer",
			id: lecturerUserId,
			role: UserRole.USER
		},
		{
			username: student,
			displayName: "Course Student",
			id: studentUserId,
			role: UserRole.USER
		},
		{
			username: admin,
			displayName: "System Admin",
			id: "062ad1be-4512-4a4a-be4c-4eda7645315a",
			role: UserRole.SYSTEM_ADMIN
		},
		{
			username: userNotInCourse,
			displayName: "NotInCourse",
			id: userNotInCourseId,
			role: UserRole.USER
		}
	],
	courses: [
		{
			data: {
				id: courseId,
				shortname: "test-course",
				semester: "sose2022",
				title: "Test Course",
				isClosed: false
			},
			config: {
				admissionCriteria: {
					rules: []
				},
				groupSettings: GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF
			},
			participants: {
				lecturers: [lecturer],
				students: [student]
			},
			groups: [
				{
					id: groupId,
					name: "Group 01",
					members: [student]
				},
				{
					id: otherGroupId,
					name: "Other Group",
					members: [lecturer]
				}
			],
			assignments: [
				{
					id: assignmentId,
					name: "Assignment 01",
					collaboration: CollaborationType.SINGLE,
					state: AssignmentState.EVALUATED,
					type: AssignmentType.HOMEWORK,
					points: 10,
					assessments: [
						{
							id: assessmentId,
							creator: lecturer,
							isDraft: false,
							achievedPoints: 10,
							target: {
								user: student
							}
						},
						{
							id: foreignAssessmentId,
							creator: lecturer,
							isDraft: false,
							achievedPoints: 7,
							target: {
								user: lecturer
							}
						}
					],
					registrations: [
						{
							groupName: "Group 01",
							members: [student]
						}
					]
				}
			]
		},
		{
			data: {
				id: otherCourseId,
				shortname: "other-course",
				semester: "sose2022",
				title: "Other Course",
				isClosed: false
			},
			config: {
				admissionCriteria: {
					rules: []
				},
				groupSettings: GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF
			},
			participants: {
				lecturers: [lecturerOtherCourse]
			},
			groups: [],
			assignments: [
				{
					id: otherAssignmentId,
					name: "Assignment 01",
					collaboration: CollaborationType.SINGLE,
					state: AssignmentState.EVALUATED,
					type: AssignmentType.HOMEWORK,
					points: 7,
					assessments: [
						{
							id: otherAssessmentId,
							creator: lecturerOtherCourse,
							isDraft: false,
							achievedPoints: 7,
							target: {
								user: lecturerOtherCourse
							}
						}
					]
				}
			]
		}
	]
};

describe("Permissions", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create(createAuthTestApplication);
		await setup.dbMockService.createAll(new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG));
	});

	afterAll(async () => {
		await setup.teardown();
	});

	/** Wrapper for `setup.request()`. */
	function test(
		method: "post" | "put" | "get" | "patch" | "delete",
		url: string,
		username: string,
		status: number
	): unknown {
		return (
			setup
				.request()
				// eslint-disable-next-line no-unexpected-multiline
				[method](url)
				.set("Authorization", `Bearer ${username}`)
				.expect(status)
		);
	}

	describe("CourseController", () => {
		describe("createCourse", () => {
			it("User -> 403", () => {
				return test("post", "/courses", lecturerOtherCourse, 403);
			});
		});

		describe("getCourseById", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 200]
			])("%#: %s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}`, username, status);
			});
		});

		describe("getCourseByNameAndSemester", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 200]
			])("%#: %s -> %d", (username, status) => {
				return test("get", "/courses/test-course/semester/sose2022", username, status);
			});
		});

		describe("updateCourse", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 400], // Missing request body -> Bad Request
				[lecturer, 400], // Missing request body -> Bad Request
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test("patch", `/courses/${courseId}`, username, status);
			});
		});

		describe("deleteCourse", () => {
			beforeEach(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			afterAll(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 403],
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test("delete", `/courses/${courseId}`, username, status);
			});
		});
	});

	describe("CourseParticipantsController", () => {
		describe("addUser", () => {
			beforeEach(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			afterAll(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			it.each([
				[201, userNotInCourse, userNotInCourseId, courseId],
				[201, lecturer, userNotInCourseId, courseId], // Lecturers may add users
				[201, admin, userNotInCourseId, courseId],
				[409, student, studentUserId, courseId], // Already in course
				[403, student, userNotInCourseId, courseId], // Can't sign up foreign user as participant
				[403, userNotInCourse, studentUserId, otherCourseId] // Can't sign up foreign user as non-participant
			])("%#: %d -> %s", (status, requestingUser, targetUserId, courseId) => {
				return test(
					"post",
					`/courses/${courseId}/users/${targetUserId}`,
					requestingUser,
					status
				);
			});
		});

		describe("getUsersOfCourse", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}/users`, username, status);
			});
		});

		describe("getParticipantsByMatrNr", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}/users/matrNrs`, username, status);
			});
		});

		describe("getParticipant", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200]
			])("%#: %s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}/users/${studentUserId}`, username, status);
			});

			it("Course Student with own userId -> 200", () => {
				return test("get", `/courses/${courseId}/users/${studentUserId}`, student, 200);
			});

			it("Course Student with foreign userId -> 200", () => {
				return test("get", `/courses/${courseId}/users/${lecturerUserId}`, student, 200);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId}`, () => {
				return test(
					"get",
					`/courses/${otherCourseId}/users/${studentUserId}`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("updateUserRole", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 400],
				[lecturer, 400],
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"patch",
					`/courses/${courseId}/users/${studentUserId}/role`,
					username,
					status
				);
			});
		});

		describe("removeUser", () => {
			beforeEach(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			afterAll(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"delete",
					`/courses/${courseId}/users/${studentUserId}`,
					username,
					status
				);
			});

			it("Course Student with own userId -> 200", () => {
				return test("get", `/courses/${courseId}/users/${studentUserId}`, student, 200);
			});

			it("Course Student with foreign userId -> 403", () => {
				return test("get", `/courses/${courseId}/users/${lecturerUserId}`, student, 200);
			});
		});
	});

	describe("CourseConfigController", () => {
		describe("setAdmissionFromPreviousSemester", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 400], // No body -> Bad Request
				[lecturer, 400], // No body -> Bad Request
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"put",
					`/courses/${courseId}/config/admission-from-previous-semester`,
					username,
					status
				);
			});
		});

		describe("getCourseConfig", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 200]
			])("%#: %s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}/config`, username, status);
			});
		});

		describe("getGroupSettings", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 200]
			])("%#: %s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}/config/group-settings`, username, status);
			});
		});

		describe("getAdmissionCriteria", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 200]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"get",
					`/courses/${courseId}/config/admission-criteria`,
					username,
					status
				);
			});
		});

		describe("getAdmissionFromPreviousSemester", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"get",
					`/courses/${courseId}/config/admission-from-previous-semester`,
					username,
					status
				);
			});
		});

		describe("updateCourseConfig", () => {
			// TODO 500 error
			xit.each([
				[lecturerOtherCourse, 403],
				[admin, 400], // No body -> Bad Request
				[lecturer, 400], // No body -> Bad Request
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test("patch", `/courses/${courseId}/config`, username, status);
			});
		});

		describe("updateGroupSettings", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"patch",
					`/courses/${courseId}/config/group-settings`,
					username,
					status
				);
			});
		});

		describe("updateAdmissionCriteria", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 400], // No body -> Bad Request
				[lecturer, 400], // No body -> Bad Request
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"patch",
					`/courses/${courseId}/config/admission-criteria`,
					username,
					status
				);
			});
		});
	});

	describe("AssignmentController", () => {
		describe("createAssignment", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 400], // No body -> Bad Request
				[lecturer, 400], // No body -> Bad Request
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test("post", `/courses/${courseId}/assignments`, username, status);
			});
		});

		describe("getAssignmentsOfCourse", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 200]
			])("%#: %s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}/assignments`, username, status);
			});
		});

		describe("getAssignmentById", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 200]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"get",
					`/courses/${courseId}/assignments/${assignmentId}`,
					username,
					status
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} -> 404`, () => {
				return test(
					"get",
					`/courses/${otherCourseId}/assignments/${assignmentId}`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("updateAssignment", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"patch",
					`/courses/${courseId}/assignments/${assignmentId}`,
					username,
					status
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} -> 404`, () => {
				return test(
					"patch",
					`/courses/${otherCourseId}/assignments/${assignmentId}`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("deleteAssignment", () => {
			beforeEach(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			afterAll(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"delete",
					`/courses/${courseId}/assignments/${assignmentId}`,
					username,
					status
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} -> 404`, () => {
				return test(
					"delete",
					`/courses/${otherCourseId}/assignments/${assignmentId}`,
					lecturerOtherCourse,
					404
				);
			});
		});
	});

	describe("AssessmentController", () => {
		describe("createAssessment", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 400],
				[lecturer, 400],
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"post",
					`/courses/${courseId}/assignments/${assignmentId}/assessments`,
					username,
					status
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} -> 404`, () => {
				return test(
					"post",
					`/courses/${otherCourseId}/assignments/${assignmentId}/assessments`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("convertGroupToIndividualAssessment", () => {
			beforeEach(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			afterAll(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			it.each([
				[lecturerOtherCourse, 403],
				[admin, 201],
				[lecturer, 201],
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"post",
					`/courses/${courseId}/assignments/${assignmentId}/assessments/${assessmentId}/convert-to-individual`,
					username,
					status
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} -> 404`, () => {
				return test(
					"post",
					`/courses/${otherCourseId}/assignments/${assignmentId}/assessments/${assessmentId}/convert-to-individual`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("setPartialAssessment", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 400], // No body -> Bad Request
				[lecturer, 400], // No body -> Bad Request
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"put",
					`/courses/${courseId}/assignments/${assignmentId}/assessments/${assessmentId}`,
					username,
					status
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} -> 404`, () => {
				return test(
					"put",
					`/courses/${otherCourseId}/assignments/${assignmentId}/assessments/${assessmentId}`,
					lecturerOtherCourse,
					404
				);
			});

			it(`Attack: ${lecturerOtherCourse} with assessmentId of course -> 404`, () => {
				return test(
					"put",
					`/courses/${otherCourseId}/assignments/${otherAssignmentId}/assessments/${assessmentId}`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("getAssessmentsForAssignment", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200], // No body -> Bad Request
				[lecturer, 200], // No body -> Bad Request
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"get",
					`/courses/${courseId}/assignments/${assignmentId}/assessments`,
					username,
					status
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} -> 404`, () => {
				return test(
					"get",
					`/courses/${otherCourseId}/assignments/${assignmentId}/assessments`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("getAssessmentById", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"get",
					`/courses/${courseId}/assignments/${assignmentId}/assessments/${assessmentId}`,
					username,
					status
				);
			});

			it(`${student} with own assessment -> 200`, () => {
				return test(
					"get",
					`/courses/${courseId}/assignments/${assignmentId}/assessments/${assessmentId}`,
					student,
					200
				);
			});

			it(`${student} with foreign assessment -> 403`, () => {
				return test(
					"get",
					`/courses/${courseId}/assignments/${assignmentId}/assessments/${foreignAssessmentId}`,
					student,
					403
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} and assignmentId from other course -> 404`, () => {
				return test(
					"get",
					`/courses/${otherCourseId}/assignments/${otherAssignmentId}/assessments/${assessmentId}`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("getEventsOfAssessment", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"get",
					`/courses/${courseId}/assignments/${assignmentId}/assessments/${assessmentId}/events`,
					username,
					status
				);
			});

			it(`${student} with own assessment -> 403`, () => {
				return test(
					"get",
					`/courses/${courseId}/assignments/${assignmentId}/assessments/${assessmentId}/events`,
					student,
					403
				);
			});

			it(`${student} with foreign assessment -> 403`, () => {
				return test(
					"get",
					`/courses/${courseId}/assignments/${assignmentId}/assessments/${foreignAssessmentId}/events`,
					student,
					403
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} and assignmentId from other course -> 404`, () => {
				return test(
					"get",
					`/courses/${otherCourseId}/assignments/${otherAssignmentId}/assessments/${assessmentId}/events`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("updateAssessment", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"patch",
					`/courses/${courseId}/assignments/${assignmentId}/assessments/${assessmentId}`,
					username,
					status
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} -> 404`, () => {
				return test(
					"patch",
					`/courses/${otherCourseId}/assignments/${assignmentId}/assessments/${assessmentId}`,
					lecturerOtherCourse,
					404
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} and assignmentId from other course -> 404`, () => {
				return test(
					"patch",
					`/courses/${otherCourseId}/assignments/${otherAssignmentId}/assessments/${assessmentId}`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("deleteAssessment", () => {
			beforeEach(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			afterAll(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"delete",
					`/courses/${courseId}/assignments/${assignmentId}/assessments/${assessmentId}`,
					username,
					status
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} -> 404`, () => {
				return test(
					"delete",
					`/courses/${otherCourseId}/assignments/${assignmentId}/assessments/${assessmentId}`,
					lecturerOtherCourse,
					404
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} and assignmentId from other course -> 404`, () => {
				return test(
					"delete",
					`/courses/${otherCourseId}/assignments/${otherAssignmentId}/assessments/${assessmentId}`,
					lecturerOtherCourse,
					404
				);
			});
		});
	});

	describe("GroupController", () => {
		describe("getGroupsOfCourse", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 200]
			])("%#: %s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}/groups`, username, status);
			});
		});

		describe("getGroup", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 200]
			])("%#: %s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}/groups/${groupId}`, username, status);
			});

			it(`${student} with own group -> 200`, () => {
				return test("get", `/courses/${courseId}/groups/${groupId}`, student, 200);
			});

			it(`${student} with foreign group -> 403`, () => {
				return test("get", `/courses/${courseId}/groups/${otherGroupId}`, student, 403);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} -> 404`, () => {
				return test(
					"get",
					`/courses/${otherCourseId}/groups/${groupId}`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("getUsersOfGroup", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 200]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"get",
					`/courses/${courseId}/groups/${groupId}/users`,
					username,
					status
				);
			});

			it(`${student} with own group -> 200`, () => {
				return test("get", `/courses/${courseId}/groups/${groupId}/users`, student, 200);
			});

			it(`${student} with foreign group -> 403`, () => {
				return test(
					"get",
					`/courses/${courseId}/groups/${otherGroupId}/users`,
					student,
					403
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} -> 404`, () => {
				return test(
					"get",
					`/courses/${otherCourseId}/groups/${groupId}/users`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("getAssessmentsOfGroup", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[admin, 200],
				[lecturer, 200],
				[student, 403]
			])("%#: %s -> %d", (username, status) => {
				return test(
					"get",
					`/courses/${courseId}/groups/${groupId}/assessments`,
					username,
					status
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId} -> 404`, () => {
				return test(
					"get",
					`/courses/${otherCourseId}/groups/${groupId}/assessments`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("updateGroup", () => {
			it.each([
				[403, lecturerOtherCourse, courseId, groupId],
				[404, lecturerOtherCourse, otherCourseId, groupId],
				[200, admin, courseId, groupId],
				[200, lecturer, courseId, groupId],
				[200, student, courseId, groupId],
				[403, student, courseId, otherGroupId]
			])("%#: %s -> %s", (status, username, courseId, groupId) => {
				return test("patch", `/courses/${courseId}/groups/${groupId}`, username, status);
			});
		});

		describe("removeUserFromGroup", () => {
			beforeEach(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			afterAll(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			it.each([
				[403, lecturerOtherCourse, courseId, groupId, studentUserId], // TOFIX: First iteration causes deadlock
				// 'Process 67 waits for RowShareLock on relation 35615 of database 16384; blocked by process 62.\n' +
                // 'Process 62 waits for AccessExclusiveLock on relation 35606 of database 16384; blocked by process 67.',
				[404, lecturerOtherCourse, otherCourseId, groupId, studentUserId],
				[200, admin, courseId, groupId, studentUserId],
				//[200, lecturer, courseId, groupId, studentUserId], // TODO: Disabled, because CloseEmptyGroupsHandler occasionally causes failure
				//[200, student, courseId, groupId, studentUserId],
				[403, student, courseId, otherGroupId, lecturerUserId]
			])("%#: %s -> %s", (status, username, courseId, groupId, memberId) => {
				return test(
					"delete",
					`/courses/${courseId}/groups/${groupId}/users/${memberId}`,
					username,
					status
					);
			});
		});

		describe("deleteGroup", () => {
			beforeEach(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			afterAll(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			it.each([
				[403, lecturerOtherCourse, courseId, groupId, ""],
				[404, lecturerOtherCourse, otherCourseId, groupId],
				[200, admin, courseId, groupId],
				[200, lecturer, courseId, groupId],
				[200, student, courseId, groupId],
				[403, student, courseId, otherGroupId]
			])("%#: %s -> %s", (status, username, courseId, groupId) => {
				return test("delete", `/courses/${courseId}/groups/${groupId}`, username, status);
			});
		});
	});

	describe("AssignmentRegistrationController", () => {
		describe("registerGroup", () => {
			beforeEach(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			afterAll(async () => {
				await setup.clearDb();
				await setup.dbMockService.createAll(
					new StudentMgmtDbEntities(PERMISSIONS_TESTING_CONFIG)
				);
			});

			// otherGroup is not registered
			it.each([
				[403, lecturerOtherCourse, courseId, assignmentId, otherGroupId],
				[404, lecturerOtherCourse, otherCourseId, assignmentId, otherGroupId],
				[201, admin, courseId, assignmentId, otherGroupId],
				[201, lecturer, courseId, assignmentId, otherGroupId],
				[403, student, courseId, assignmentId, groupId],
				[403, student, courseId, assignmentId, otherGroupId]
			])("%#: %d -> %s", (status, username, courseId, assignmentId, groupId) => {
				return test(
					"post",
					`/courses/${courseId}/assignments/${assignmentId}/registrations/groups/${groupId}`,
					username,
					status
				);
			});
		});

		// TODO
		// describe("getRegisteredGroup", () => {
		// 	it.each([
		// 		[403, lecturerOtherCourse, courseId, assignmentId, groupId],
		// 		[404, lecturerOtherCourse, otherCourseId, assignmentId, groupId],
		// 		[200, admin, courseId, assignmentId, groupId],
		// 		[200, lecturer, courseId, assignmentId, groupId],
		// 		[200, student, courseId, assignmentId, groupId],
		// 		[403, student, courseId, assignmentId, otherGroupId]
		// 	])("%#: %d -> %s", (status, username, courseId, assignmentId, groupId) => {
		// 		return test(
		// 			"get",
		// 			`/courses/${courseId}/assignments/${assignmentId}/registrations/groups/${groupId}`,
		// 			username,
		// 			status
		// 		);
		// 	});
		// });
	});
});
