import { CourseRole } from "../../src/shared/enums";
import { COURSE_JAVA_1920 } from "./courses.mock";
import { USER_STUDENT_JAVA, USER_STUDENT_2_JAVA, USER_STUDENT_3_JAVA_TUTOR, USER_MGMT_ADMIN_JAVA_LECTURER } from "./users.mock";
import { ASSESSMENT_JAVA_EVALUATED_GROUP_1, ASSESSMENT_JAVA_TESTAT_USER_1 } from "./assessments.mock";
import { GROUP_1_JAVA } from "./groups.mock";

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
	}
];

export const AssessmentUserRelationsMock = [
	{
		assessmentId: ASSESSMENT_JAVA_EVALUATED_GROUP_1.id,
		userId: USER_STUDENT_JAVA.id
	},
	{
		assessmentId: ASSESSMENT_JAVA_EVALUATED_GROUP_1.id,
		userId: USER_STUDENT_2_JAVA.id
	},
	{
		assessmentId: ASSESSMENT_JAVA_TESTAT_USER_1.id,
		userId: USER_STUDENT_JAVA.id
	}
];

export const UserGroupRelationsMock = [
	{
		id: 1,
		userId: USER_STUDENT_JAVA.id,
		groupId: GROUP_1_JAVA.id
	},
	{
		id: 2,
		userId: USER_STUDENT_2_JAVA.id,
		groupId: GROUP_1_JAVA.id
	}

];
