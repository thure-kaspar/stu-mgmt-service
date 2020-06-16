import { CourseRole } from "../../src/shared/enums";
import { COURSE_JAVA_1920, COURSE_INFO_2_2020, COURSE_JAVA_2020 } from "./courses.mock";
import { USER_STUDENT_JAVA, USER_STUDENT_2_JAVA, USER_STUDENT_3_JAVA_TUTOR, USER_MGMT_ADMIN_JAVA_LECTURER, USER_ELSHAR, USER_KUNOLD } from "./users.mock";
import { ASSESSMENT_JAVA_EVALUATED_GROUP_1, ASSESSMENT_JAVA_TESTAT_USER_1, ASSESSMENT_JAVA_IN_REVIEW } from "./assessments.mock";

export const CourseUserRelationsMock = [
	{
		id: 1,
		courseId: COURSE_JAVA_1920.id,
		userId: USER_STUDENT_JAVA.id,
		role: CourseRole.STUDENT
	},
	{
		id: 2,
		courseId: COURSE_JAVA_1920.id,
		userId: USER_STUDENT_2_JAVA.id,
		role: CourseRole.STUDENT
	},
	{
		id: 3,
		courseId: COURSE_JAVA_1920.id,
		userId: USER_STUDENT_3_JAVA_TUTOR.id,
		role: CourseRole.TUTOR
	},
	{
		id: 4,
		courseId: COURSE_JAVA_1920.id,
		userId: USER_MGMT_ADMIN_JAVA_LECTURER.id,
		role: CourseRole.LECTURER
	},
	{
		id: 5,
		courseId: COURSE_INFO_2_2020.id,
		userId: USER_MGMT_ADMIN_JAVA_LECTURER.id,
		role: CourseRole.LECTURER
	},
	{
		id: 6,
		courseId: COURSE_JAVA_2020.id,
		userId: USER_ELSHAR.id,
		role: CourseRole.STUDENT
	},
	{
		id: 7,
		courseId: COURSE_JAVA_2020.id,
		userId: USER_KUNOLD.id,
		role: CourseRole.STUDENT
	},
	{
		id: 8,
		courseId: COURSE_JAVA_1920.id,
		userId: USER_ELSHAR.id,
		role: CourseRole.STUDENT
	},
	{
		id: 9,
		courseId: COURSE_JAVA_1920.id,
		userId: USER_KUNOLD.id,
		role: CourseRole.STUDENT
	},

];

export const AssessmentUserRelationsMock = [
	{
		assessmentId: ASSESSMENT_JAVA_EVALUATED_GROUP_1.id,
		assignmentId: ASSESSMENT_JAVA_EVALUATED_GROUP_1.assignmentId,
		userId: USER_STUDENT_JAVA.id
	},
	{
		assessmentId: ASSESSMENT_JAVA_EVALUATED_GROUP_1.id,
		assignmentId: ASSESSMENT_JAVA_EVALUATED_GROUP_1.assignmentId,
		userId: USER_STUDENT_2_JAVA.id
	},
	{
		assessmentId: ASSESSMENT_JAVA_TESTAT_USER_1.id,
		assignmentId: ASSESSMENT_JAVA_TESTAT_USER_1.assignmentId,
		userId: USER_STUDENT_JAVA.id
	},
	{
		assessmentId: ASSESSMENT_JAVA_IN_REVIEW.id,
		assignmentId: ASSESSMENT_JAVA_IN_REVIEW.assignmentId,
		userId: USER_STUDENT_JAVA.id
	},
	
];
