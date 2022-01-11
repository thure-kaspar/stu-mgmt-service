import * as assessments from "../mocks/assessments.mock";
import * as assignments from "../mocks/assignments.mock";
import { ADMISSION_CRITERIA_MOCK } from "../mocks/course-config/admission-criteria.mock";
import {
	GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF,
	GROUP_SETTINGS_NO_GROUPS
} from "../mocks/course-config/group-settings.mock";
import * as courses from "../mocks/courses.mock";
import * as groups from "../mocks/groups/groups.mock";
import {
	PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW,
	PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW
} from "../mocks/partial-assessments.mock";
import * as users from "../mocks/users.mock";
import { CourseSetup, StudentMgmtDbData } from "../utils/demo-db";

const defaultRegistrations: StudentMgmtDbData["courses"][0]["assignments"][0]["registrations"] = [
	{
		groupName: "Testgroup 1",
		members: ["mmustermann", "jdoe"]
	},
	{
		groupName: "Testgroup 2",
		members: []
	},
	{
		groupName: "Testgroup 3",
		members: ["elshar", "kunold"]
	}
];

const JAVA_WISE1920: CourseSetup = {
	data: courses.COURSE_JAVA_1920,
	config: {
		password: "password",
		groupSettings: GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF,
		admissionCriteria: ADMISSION_CRITERIA_MOCK
	},
	participants: {
		lecturers: [users.USER_MGMT_ADMIN_JAVA_LECTURER.username],
		tutors: [users.USER_STUDENT_3_JAVA_TUTOR.username, users.USER_FROM_AUTH_SYSTEM.username],
		students: [
			users.USER_STUDENT_JAVA.username,
			users.USER_STUDENT_2_JAVA.username,
			users.USER_ELSHAR.username,
			users.USER_KUNOLD.username
		]
	},
	groups: [
		{
			...groups.GROUP_1_JAVA,
			members: [users.USER_STUDENT_JAVA.username, users.USER_STUDENT_2_JAVA.username],
			events: [
				{
					event: "UserJoinedGroupEvent",
					username: users.USER_STUDENT_JAVA.username,
					timestamp: new Date(2022, 1, 1)
				},
				{
					event: "UserJoinedGroupEvent",
					username: users.USER_ELSHAR.username,
					timestamp: new Date(2022, 1, 3)
				},
				{
					event: "UserJoinedGroupEvent",
					username: users.USER_STUDENT_2_JAVA.username,
					timestamp: new Date(2022, 1, 2)
				},
				{
					event: "UserLeftGroupEvent",
					username: users.USER_ELSHAR.username,
					timestamp: new Date(2022, 1, 4)
				}
			]
		},
		{
			...groups.GROUP_2_JAVA,
			isClosed: true,
			members: []
		},
		{
			...groups.GROUP_4_JAVA,
			members: [users.USER_ELSHAR.username, users.USER_KUNOLD.username]
		}
	],
	assignments: [
		assignments.ASSIGNMENT_JAVA_CLOSED,
		assignments.ASSIGNMENT_JAVA_INVISIBLE,
		assignments.ASSIGNMENT_JAVA_TESTAT_IN_PROGRESS_SINGLE,
		{
			...assignments.ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP,
			registrations: defaultRegistrations,
			submissions: [
				{
					date: new Date(2022, 1, 1),
					username: users.USER_STUDENT_JAVA.username,
					group: groups.GROUP_1_JAVA.name,
					payload: {
						hello: "world"
					}
				},
				{
					date: new Date(2022, 1, 2),
					username: users.USER_STUDENT_JAVA.username,
					group: groups.GROUP_1_JAVA.name,
					links: [{ name: "A link", url: "http://example.url" }]
				}
			]
		},
		{
			...assignments.ASSIGNMENT_JAVA_IN_REVIEW_SINGLE,
			assessments: [
				{
					...assessments.ASSESSMENT_JAVA_IN_REVIEW,
					partialAssessments: [
						PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW,
						PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW
					],
					creator: users.USER_STUDENT_3_JAVA_TUTOR.username,
					target: {
						user: users.USER_STUDENT_JAVA.username
					}
				},
				{
					...assessments.ASSESSMENT_JAVA_IN_REVIEW_NO_PARTIALS,
					creator: "jdoe",
					target: {
						user: "jdoe"
					}
				}
			]
		},
		{
			...assignments.ASSIGNMENT_JAVA_EVALUATED,
			registrations: defaultRegistrations,
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
			registrations: defaultRegistrations,
			assessments: [
				{
					...assessments.ASSESSMENT_JAVA_IN_REVIEW_GROUP_PARTIALS,
					partialAssessments: [
						PARTIAL_ASSESSMENT_1_JAVA_IN_REVIEW,
						PARTIAL_ASSESSMENT_2_JAVA_IN_REVIEW
					],
					creator: users.USER_STUDENT_3_JAVA_TUTOR.username,
					target: {
						group: groups.GROUP_1_JAVA.name
					}
				}
			]
		}
	]
};

const JAVA_SOSE2020: CourseSetup = {
	data: courses.COURSE_JAVA_2020,
	config: {
		groupSettings: GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF,
		admissionCriteria: {
			rules: []
		}
	},
	assignments: [...assignments.ASSIGNMENTS_JAVA_2020],
	groups: [],
	participants: {
		students: ["elshar", "kunold"],
		lecturers: []
	}
};

const JAVA_WISE1819: CourseSetup = {
	data: courses.COURSE_JAVA_1819,
	config: {
		groupSettings: GROUP_SETTINGS_NO_GROUPS,
		admissionCriteria: {
			rules: []
		},
		password: "password"
	},
	assignments: [],
	groups: [],
	participants: {
		lecturers: []
	}
};

const INFO2_SOSE2020: CourseSetup = {
	data: courses.COURSE_INFO_2_2020,
	config: {
		groupSettings: GROUP_SETTINGS_NO_GROUPS,
		admissionCriteria: {
			rules: []
		}
	},
	assignments: [...assignments.ASSIGNMENTS_INFO_2020],
	groups: [],
	participants: {
		lecturers: [users.USER_MGMT_ADMIN_JAVA_LECTURER.username]
	}
};

export const TESTING_CONFIG: StudentMgmtDbData = {
	users: users.UsersMock,
	courses: [JAVA_WISE1920, JAVA_SOSE2020, JAVA_WISE1819, INFO2_SOSE2020]
};
