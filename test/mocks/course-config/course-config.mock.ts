import { CourseConfigDto } from "../../../src/course/dto/course-config/course-config.dto";
import { GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF, GROUP_SETTINGS_NO_GROUPS } from "./group-settings.mock";
import { ASSIGNMENT_TEMPLATES_MOCK } from "./assignment-templates.mock";
import { ADMISSION_CRITERIA_MOCK } from "./admission-criteria.mock";

export const COURSE_CONFIG_JAVA_1920: CourseConfigDto = {
	id: 1,
	groupSettings: GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF,
	assignmentTemplates: ASSIGNMENT_TEMPLATES_MOCK,
	admissionCriteria: ADMISSION_CRITERIA_MOCK,
	password: "password",
	subscriptionUrl: "http://example-url.com/api/update"
};

export const COURSE_CONFIG_COURSE_JAVA_1819: CourseConfigDto = {
	id: 2,
	groupSettings: GROUP_SETTINGS_NO_GROUPS,
	assignmentTemplates: ASSIGNMENT_TEMPLATES_MOCK,
	admissionCriteria: null,
	password: "password",
	subscriptionUrl: "http://example-url.com/api/update"
};

export const COURSE_CONFIG_COURSE_JAVA2020: CourseConfigDto = {
	id: 3,
	groupSettings: GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF,
	assignmentTemplates: ASSIGNMENT_TEMPLATES_MOCK,
	admissionCriteria: null,
	subscriptionUrl: "http://127.0.0.1:1111/rest/update"
};

export const COURSE_CONFIG_COURSE_INFO_2_2020: CourseConfigDto = {
	id: 4,
	groupSettings: GROUP_SETTINGS_NO_GROUPS,
	assignmentTemplates: ASSIGNMENT_TEMPLATES_MOCK,
	admissionCriteria: null,
};



export const COURSE_CONFIGS_MOCK: CourseConfigDto[] = [
	COURSE_CONFIG_JAVA_1920,
	COURSE_CONFIG_COURSE_JAVA_1819,
	COURSE_CONFIG_COURSE_JAVA2020,
	COURSE_CONFIG_COURSE_INFO_2_2020,
];
