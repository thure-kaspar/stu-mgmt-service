import { UserRole } from "../../src/shared/enums";
import { CourseSetup, StudentMgmtDbData } from "../utils/demo-db";

const COURSE_ISUM_DEFAULT: Omit<CourseSetup, "data"> = {
	config: {
		admissionCriteria: {
			rules: []
		},
		groupSettings: {
			allowGroups: false,
			autoJoinGroupOnCourseJoined: false,
			mergeGroupsOnAssignmentStarted: false,
			selfmanaged: false,
			sizeMin: 0,
			sizeMax: 0
		}
	},
	participants: {
		lecturers: ["user", "dumbledore"],
		students: ["mmustermann", "hpotter", "rweasley", "dmalfoy"]
	},
	assignments: [],
	groups: []
};

const COURSE_Unternehmensmodellierung: CourseSetup = {
	...COURSE_ISUM_DEFAULT,
	data: {
		id: "semUM-wise2122",
		shortname: "semUM",
		semester: "wise2122",
		title: "Seminar Unternehmensmodellierung (Master)",
		isClosed: false
	}
};

const COURSE_Dienstleistungsmanagement: CourseSetup = {
	...COURSE_ISUM_DEFAULT,
	data: {
		id: "semDL-wise2122",
		shortname: "semDL",
		semester: "wise2122",
		title: "Seminar Dienstleistungsmanagement und -innovation (Master)",
		isClosed: false
	}
};

const COURSE_Wirtschaftsinformatik_WISE_2122: CourseSetup = {
	...COURSE_ISUM_DEFAULT,
	data: {
		id: "semWI-wise2122",
		shortname: "semWI",
		semester: "wise2122",
		title: "Seminar Wirtschaftsinformatik (Bachelor)",
		isClosed: false
	}
};

const COURSE_Wirtschaftsinformatik_SOSE_2022: CourseSetup = {
	...COURSE_ISUM_DEFAULT,
	data: {
		id: "semWI-sose2022",
		shortname: "semWI",
		semester: "sose2022",
		title: "Seminar Wirtschaftsinformatik (Bachelor)",
		isClosed: false
	}
};

export const ISUM_ONLY_CONFIG: StudentMgmtDbData = {
	users: [
		{
			id: "22bff4cb-94bb-4d88-8624-55ff3a53a52b",
			displayName: "Harry Potter",
			username: "hpotter",
			email: "hpotter@example.email",
			matrNr: 123456,
			role: UserRole.USER
		},
		{
			id: "27569cf9-110d-4523-a177-a1ee2a89a34f",
			displayName: "Ron Weasley",
			username: "rweasley",
			email: "rweasley@example.email",
			matrNr: 654321,
			role: UserRole.USER
		},
		{
			id: "11f89ffc-e646-4bfa-b978-e148aae21a8d",
			displayName: "Draco Malfoy",
			username: "dmalfoy",
			email: "dmalfoy@example.email",
			matrNr: 111222,
			role: UserRole.USER
		},
		{
			id: "b39c19de-ea2d-48a9-803e-ca641bcdd393",
			displayName: "Albus Dumbledore",
			username: "dumbledore",
			email: "dumbledore@example.email",
			role: UserRole.USER
		}
	],
	courses: [
		COURSE_Unternehmensmodellierung,
		COURSE_Dienstleistungsmanagement,
		COURSE_Wirtschaftsinformatik_WISE_2122,
		COURSE_Wirtschaftsinformatik_SOSE_2022
	]
};
