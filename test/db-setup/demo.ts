import { ADMISSION_CRITERIA_MOCK } from "../mocks/course-config/admission-criteria.mock";
import { GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF } from "../mocks/course-config/group-settings.mock";
import * as courses from "../mocks/courses.mock";
import * as groups from "../mocks/groups/groups.mock";
import * as users from "../mocks/users.mock";
import * as assignments from "../mocks/assignments.mock";
import * as assessments from "../mocks/assessments.mock";
import { StudentMgmtDbData } from "../utils/demo-db";

// TODO: WIP

const JAVA_WISE1920: StudentMgmtDbData["courses"][0] = {
	data: courses.COURSE_JAVA_1920,
	config: {
		groupSettings: GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF,
		admissionCriteria: ADMISSION_CRITERIA_MOCK
	},
	participants: {
		lecturers: [users.USER_MGMT_ADMIN_JAVA_LECTURER.username],
		tutors: [users.USER_STUDENT_3_JAVA_TUTOR.username],
		students: [
			users.USER_STUDENT_JAVA.username,
			users.USER_STUDENT_2_JAVA.username,
			users.USER_ELSHAR.username,
			users.USER_KUNOLD.username,
			users.USER_FROM_AUTH_SYSTEM.username
		]
	},
	groups: [
		{
			...groups.GROUP_1_JAVA,
			members: [users.USER_STUDENT_JAVA.username, users.USER_STUDENT_2_JAVA.username]
		},
		{
			...groups.GROUP_2_JAVA,
			members: []
		},
		{
			...groups.GROUP_4_JAVA,
			members: [users.USER_ELSHAR.username, users.USER_KUNOLD.username]
		}
	],
	assignments: [
		assignments.ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP,
		assignments.ASSIGNMENT_JAVA_CLOSED,
		assignments.ASSIGNMENT_JAVA_INVISIBLE,
		assignments.ASSIGNMENT_JAVA_TESTAT_IN_PROGRESS_SINGLE,
		{
			...assignments.ASSIGNMENT_JAVA_IN_REVIEW_SINGLE,
			assessments: [
				{
					...assessments.ASSESSMENT_JAVA_IN_REVIEW,
					creator: users.USER_STUDENT_3_JAVA_TUTOR.username,
					target: {
						user: users.USER_STUDENT_JAVA.username
					}
				}
			]
		},
		{
			...assignments.ASSIGNMENT_JAVA_EVALUATED,
			assessments: [
				{
					...assessments.ASSESSMENT_JAVA_EVALUATED_GROUP_1,
					creator: users.USER_STUDENT_3_JAVA_TUTOR.username,
					target: {
						group: groups.GROUP_1_JAVA.name
					}
				},
				{
					...assessments.ASSESSMENT_JAVA_EVALUATED_GROUP_2,
					creator: users.USER_STUDENT_3_JAVA_TUTOR.username,
					target: {
						group: groups.GROUP_2_JAVA.name
					}
				}
			]
		},

		{
			...assignments.ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE,
			assessments: [
				{
					...assessments.ASSESSMENT_JAVA_TESTAT_USER_1,
					creator: users.USER_STUDENT_3_JAVA_TUTOR.username,
					target: {
						user: users.USER_STUDENT_JAVA.username
					}
				}
			]
		},
		{
			...assignments.ASSIGNMENT_JAVA_IN_REVIEW_GROUP,
			assessments: [
				{
					...assessments.ASSESSMENT_JAVA_IN_REVIEW_GROUP_PARTIALS,
					creator: users.USER_STUDENT_3_JAVA_TUTOR.username,
					target: {
						group: groups.GROUP_1_JAVA.name
					}
				}
			]
		}
	]
};

export const DEMO_CONFIG: StudentMgmtDbData = {
	users: users.UsersMock,
	courses: [JAVA_WISE1920]
};
