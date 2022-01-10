import { StudentMgmtDbData } from "../utils/demo-db";
import { RuleType } from "../../src/admission-status/rules/abstract-rules";
import { Severity } from "../../src/assessment/dto/marker.dto";
import {
	AssignmentState,
	AssignmentType,
	CollaborationType,
	UserRole
} from "../../src/shared/enums";
import { RoundingType } from "../../src/utils/math";

export const EXAMPLE_CONFIG: StudentMgmtDbData = {
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
		{
			data: {
				id: "datda-sose2022",
				shortname: "datda",
				semester: "sose2022",
				title: "Defence Against the Dark Arts",
				isClosed: false
			},
			config: {
				admissionCriteria: {
					rules: [
						{
							achievedPercentRounding: {
								type: RoundingType.UP_NEAREST_INTEGER
							},
							requiredPercent: 50,
							assignmentType: AssignmentType.HOMEWORK,
							type: RuleType.REQUIRED_PERCENT_OVERALL
						}
					]
				},
				groupSettings: {
					allowGroups: true,
					autoJoinGroupOnCourseJoined: false,
					mergeGroupsOnAssignmentStarted: false,
					selfmanaged: true,
					sizeMax: 2,
					sizeMin: 2
				}
			},
			participants: {
				students: ["hpotter", "rweasley", "dmalfoy"],
				lecturers: ["dumbledore"]
			},
			groups: [
				{
					name: "Gryffindor",
					members: ["hpotter", "rweasley"]
				},
				{
					name: "Slytherin",
					members: ["dmalfoy"]
				}
			],
			assignments: [
				{
					id: "9a7d9e86-9ff3-4d1a-81e6-e065b56db509",
					name: "Assignment 01",
					type: AssignmentType.HOMEWORK,
					collaboration: CollaborationType.GROUP,
					state: AssignmentState.EVALUATED,
					points: 12,
					assessments: [
						{
							id: "4132efa8-a40d-4587-87c2-924249c24830",
							isDraft: false,
							creator: "dumbledore",
							target: {
								group: "Gryffindor"
							},
							achievedPoints: 10
						},
						{
							id: "7933ee59-eda2-4ae9-b386-320e2e346ef9",
							isDraft: true,
							creator: "dumbledore",
							target: {
								group: "Slytherin"
							},
							achievedPoints: 5
						}
					]
				},
				{
					id: "618fc257-2d79-42da-93bd-7c077f9c3f99",
					name: "Assignment 02",
					type: AssignmentType.SEMINAR,
					collaboration: CollaborationType.SINGLE,
					state: AssignmentState.IN_PROGRESS,
					points: 10,
					comment: "Write an essay on the defence against Dementors.",
					assessments: [
						{
							id: "4df0d1ec-1137-4836-86cc-71bb9cf4678d",
							isDraft: true,
							creator: "dumbledore",
							target: {
								user: "dmalfoy"
							},
							achievedPoints: 7,
							partialAssessments: [
								{
									draftOnly: false,
									title: "Partial Assessment 01",
									key: "abc-123",
									markers: [
										{
											comment: "Lorem ipsum...",
											path: "src/Main.java",
											severity: Severity.WARNING,
											startLineNumber: 0,
											endLineNumber: 0
										}
									]
								}
							]
						}
					]
				}
			]
		}
	]
};
