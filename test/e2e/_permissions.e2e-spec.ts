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
const systemAdmin = "systemAdmin";
const courseStudent = "courseStudent";
const courseStudentUserId = "a44c818b-4494-4d78-8fd3-dfada7e2359c";
const courseLecturer = "courseLecturer";
const courseLecturerUserId = "ae85f9ab-2bcd-4cd1-a1ad-382f9900d54b";
const courseId = "test-course";
const otherCourseId = "other-course";
const assignmentId = "44e9e03b-6c53-402c-bae5-78f3adfde797";
const otherAssignmentId = "f5dff9f7-74ac-48a0-9235-3fe11ce8f256";
const groupId = "130f0ced-c619-4ccc-acca-10409decc83c";
const assessmentId = "466bf71e-6bdd-4f6b-90fd-b339b2dc16f6";
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
			username: courseLecturer,
			displayName: "Course Lecturer",
			id: courseLecturerUserId,
			role: UserRole.USER
		},
		{
			username: courseStudent,
			displayName: "Course Student",
			id: courseStudentUserId,
			role: UserRole.USER
		},
		{
			username: systemAdmin,
			displayName: "System Admin",
			id: "062ad1be-4512-4a4a-be4c-4eda7645315a",
			role: UserRole.SYSTEM_ADMIN
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
				lecturers: [courseLecturer],
				students: [courseStudent]
			},
			groups: [
				{
					id: groupId,
					name: "Group 01",
					members: [courseLecturer]
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
							creator: courseLecturer,
							isDraft: false,
							achievedPoints: 10,
							target: {
								user: courseLecturer
							}
						}
					],
					registrations: [
						{
							groupName: "Group 01",
							members: [courseLecturer]
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
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 200]
			])("%s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}`, username, status);
			});
		});

		describe("getCourseByNameAndSemester", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 200]
			])("%s -> %d", (username, status) => {
				return test("get", "/courses/test-course/semester/sose2022", username, status);
			});
		});

		describe("updateCourse", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[systemAdmin, 400], // Missing request body -> Bad Request
				[courseLecturer, 400], // Missing request body -> Bad Request
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
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
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
				return test("delete", `/courses/${courseId}`, username, status);
			});
		});
	});

	describe("CourseParticipantsController", () => {
		describe("getUsersOfCourse", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}/users`, username, status);
			});
		});

		describe("getParticipantsByMatrNr", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}/users/matrNrs`, username, status);
			});
		});

		describe("getParticipant", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[systemAdmin, 200],
				[courseLecturer, 200]
			])("%s -> %d", (username, status) => {
				return test(
					"get",
					`/courses/${courseId}/users/${courseStudentUserId}`,
					username,
					status
				);
			});

			it("Course Student with own userId -> 200", () => {
				return test(
					"get",
					`/courses/${courseId}/users/${courseStudentUserId}`,
					courseStudent,
					200
				);
			});

			it("Course Student with foreign userId -> 200", () => {
				return test(
					"get",
					`/courses/${courseId}/users/${courseLecturerUserId}`,
					courseStudent,
					200
				);
			});

			it(`Attack: ${lecturerOtherCourse} with courseId=${otherCourseId}`, () => {
				return test(
					"get",
					`/courses/${otherCourseId}/users/${courseStudentUserId}`,
					lecturerOtherCourse,
					404
				);
			});
		});

		describe("updateUserRole", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[systemAdmin, 400],
				[courseLecturer, 400],
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
				return test(
					"patch",
					`/courses/${courseId}/users/${courseStudentUserId}/role`,
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
				[systemAdmin, 200],
				[courseLecturer, 200]
			])("%s -> %d", (username, status) => {
				return test(
					"delete",
					`/courses/${courseId}/users/${courseStudentUserId}`,
					username,
					status
				);
			});

			it("Course Student with own userId -> 200", () => {
				return test(
					"get",
					`/courses/${courseId}/users/${courseStudentUserId}`,
					courseStudent,
					200
				);
			});

			it("Course Student with foreign userId -> 403", () => {
				return test(
					"get",
					`/courses/${courseId}/users/${courseLecturerUserId}`,
					courseStudent,
					200
				);
			});
		});
	});

	describe("CourseConfigController", () => {
		describe("setAdmissionFromPreviousSemester", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[systemAdmin, 400], // No body -> Bad Request
				[courseLecturer, 400], // No body -> Bad Request
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
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
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 200]
			])("%s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}/config`, username, status);
			});
		});

		describe("getGroupSettings", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 200]
			])("%s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}/config/group-settings`, username, status);
			});
		});

		describe("getAdmissionCriteria", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 200]
			])("%s -> %d", (username, status) => {
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
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
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
				[systemAdmin, 400], // No body -> Bad Request
				[courseLecturer, 400], // No body -> Bad Request
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
				return test("patch", `/courses/${courseId}/config`, username, status);
			});
		});

		describe("updateGroupSettings", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
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
				[systemAdmin, 400], // No body -> Bad Request
				[courseLecturer, 400], // No body -> Bad Request
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
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
				[systemAdmin, 400], // No body -> Bad Request
				[courseLecturer, 400], // No body -> Bad Request
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
				return test("post", `/courses/${courseId}/assignments`, username, status);
			});
		});

		describe("getAssignmentsOfCourse", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 200]
			])("%s -> %d", (username, status) => {
				return test("get", `/courses/${courseId}/assignments`, username, status);
			});
		});

		describe("getAssignmentById", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 200]
			])("%s -> %d", (username, status) => {
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
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
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
				[systemAdmin, 200],
				[courseLecturer, 200],
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
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
				[systemAdmin, 400],
				[courseLecturer, 400],
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
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

		describe("setPartialAssessment", () => {
			it.each([
				[lecturerOtherCourse, 403],
				[systemAdmin, 400], // No body -> Bad Request
				[courseLecturer, 400], // No body -> Bad Request
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
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
				[systemAdmin, 200], // No body -> Bad Request
				[courseLecturer, 200], // No body -> Bad Request
				[courseStudent, 403]
			])("%s -> %d", (username, status) => {
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
	});
});
