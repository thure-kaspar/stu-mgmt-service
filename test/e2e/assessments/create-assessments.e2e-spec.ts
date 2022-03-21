import { BadRequestException } from "@nestjs/common";
import { AssessmentCreateDto } from "../../../src/assessment/dto/assessment.dto";
import { AssessmentRepository } from "../../../src/assessment/repositories/assessment.repository";
import {
	AssignmentState,
	AssignmentType,
	CollaborationType,
	UserRole
} from "../../../src/shared/enums";
import { createAuthTestApplication } from "../../mocks/application.mock";
import { StudentMgmtDbData, StudentMgmtDbEntities } from "../../utils/demo-db";
import { TestSetup } from "../../utils/e2e";

const hpotter = "hpotter";
const rweasley = "rweasley";
const dmalfoy = "dmalfoy";
const dumbledore = "dumbledore";
const Gryffindor = "Gryffindor";
const GryffindorId = "c712b961-e38f-475b-8f09-77a994097112";
const Slytherin = "Slytherin";
const SlytherinId = "5711c719-0136-4499-8b19-5ecd692f1ba9";
const course = "datda-sose2022";
const assignment_1 = "9a7d9e86-9ff3-4d1a-81e6-e065b56db509";
const assignment_2 = "618fc257-2d79-42da-93bd-7c077f9c3f99";

const data: StudentMgmtDbData = {
	users: [
		{
			id: "22bff4cb-94bb-4d88-8624-55ff3a53a52b",
			displayName: "Harry Potter",
			username: hpotter,
			email: "hpotter@example.email",
			matrNr: 123456,
			role: UserRole.USER
		},
		{
			id: "27569cf9-110d-4523-a177-a1ee2a89a34f",
			displayName: "Ron Weasley",
			username: rweasley,
			email: "rweasley@example.email",
			matrNr: 654321,
			role: UserRole.USER
		},
		{
			id: "11f89ffc-e646-4bfa-b978-e148aae21a8d",
			displayName: "Draco Malfoy",
			username: dmalfoy,
			email: "dmalfoy@example.email",
			matrNr: 111222,
			role: UserRole.USER
		},
		{
			id: "b39c19de-ea2d-48a9-803e-ca641bcdd393",
			displayName: "Albus Dumbledore",
			username: dumbledore,
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
					rules: []
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
				students: [hpotter, rweasley, dmalfoy],
				lecturers: [dumbledore]
			},
			groups: [
				{
					id: "c712b961-e38f-475b-8f09-77a994097112",
					name: Gryffindor,
					members: [hpotter, rweasley]
				},
				{
					id: "5711c719-0136-4499-8b19-5ecd692f1ba9",
					name: Slytherin,
					members: [dmalfoy]
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
					registrations: [
						{
							groupName: Gryffindor,
							members: [hpotter, rweasley]
						},
						{
							groupName: Slytherin,
							members: [dmalfoy]
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
							creator: dumbledore,
							target: {
								user: dmalfoy
							},
							achievedPoints: 7
						}
					]
				}
			]
		}
	]
};

describe("Create Assessments", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create(createAuthTestApplication);
		await setup.dbMockService.createAll(new StudentMgmtDbEntities(data));
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("No conflicts -> Creates multiple assessments", () => {
		it("Send request", () => {
			const assessments: AssessmentCreateDto[] = [
				{
					assignmentId: assignment_1,
					isDraft: false,
					groupId: GryffindorId,
					achievedPoints: 10,
					comment: `Comment for ${Gryffindor}.`,
					partialAssessments: [
						{
							draftOnly: false,
							title: "A partial assessment",
							comment: "lorem ipsum..."
						}
					]
				},
				{
					assignmentId: assignment_1,
					isDraft: false,
					groupId: SlytherinId,
					achievedPoints: 5,
					comment: `Comment for ${Slytherin}.`
				}
			];

			return setup
				.requestWithAuth(
					"post",
					`/courses/${course}/assignments/${assignment_1}/assessments/bulk`,
					dumbledore
				)
				.send(assessments)
				.expect(201);
		});

		it("Assertions", async () => {
			const repo = setup.app.get(AssessmentRepository);
			const [assessments, count] = await repo.getAssessmentsForAssignment(assignment_1);

			expect(assessments).toHaveLength(2);
			expect(count).toEqual(2);

			const [assessment1, assessment2] = assessments;

			expect(assessment1.achievedPoints).toEqual(10);
			expect(assessment2.achievedPoints).toEqual(5);

			expect(assessment1.assessmentUserRelations).toHaveLength(2);
			expect(assessment2.assessmentUserRelations).toHaveLength(1);

			expect(assessment1.partialAssessments).toHaveLength(1);

			const [weasley, potter] = assessment1.assessmentUserRelations;
			expect(weasley.user.username).toEqual(rweasley);
			expect(potter.user.username).toEqual(hpotter);

			const [malfoy] = assessment2.assessmentUserRelations;
			expect(malfoy.user.username).toEqual(dmalfoy);
		});
	});

	it("Participant already has assessment -> 409 Conflict", () => {
		const assessments: AssessmentCreateDto[] = [
			{
				assignmentId: assignment_2,
				isDraft: false,
				userId: "11f89ffc-e646-4bfa-b978-e148aae21a8d", // dmalfoy
				achievedPoints: 5
			}
		];

		return setup
			.requestWithAuth(
				"post",
				`/courses/${course}/assignments/${assignment_2}/assessments/bulk`,
				dumbledore
			)
			.send(assessments)
			.expect(409);
	});

	describe("AssessmentRepository", () => {
		describe("_createAssessmentEntities", () => {
			it("With groupId", async () => {
				const repo = setup.app.get(AssessmentRepository);

				const assessments: AssessmentCreateDto[] = [
					{
						assignmentId: "wrong_id",
						isDraft: false,
						groupId: GryffindorId,
						achievedPoints: 10,
						comment: `Comment for ${Gryffindor}.`
					},
					{
						assignmentId: "wrong_id",
						isDraft: false,
						groupId: SlytherinId,
						achievedPoints: 5,
						comment: `Comment for ${Slytherin}.`
					}
				];

				const result = await repo._createAssessmentEntities(
					assignment_1,
					assessments,
					"creatorId"
				);

				expect(result).toHaveLength(2);
				expect(result[0].assignmentId).toEqual(assignment_1);
				expect(result[0].assessmentUserRelations).toHaveLength(2);
				expect(result[0].creatorId).toEqual("creatorId");
			});

			it("With userId", async () => {
				const repo = setup.app.get(AssessmentRepository);

				const assessments: AssessmentCreateDto[] = [
					{
						assignmentId: "wrong_id",
						isDraft: false,
						userId: "userId"
					}
				];

				const result = await repo._createAssessmentEntities(
					assignment_1,
					assessments,
					"creatorId"
				);

				expect(result).toHaveLength(1);
				expect(result[0].assessmentUserRelations).toHaveLength(1);
			});

			it("With partialAssessments", async () => {
				const repo = setup.app.get(AssessmentRepository);

				const assessments: AssessmentCreateDto[] = [
					{
						assignmentId: "wrong_id",
						isDraft: false,
						userId: "userId",
						partialAssessments: [
							{
								title: "A partial assessment",
								draftOnly: false,
								comment: "lorem ipsum..."
							}
						]
					}
				];

				const result = await repo._createAssessmentEntities(
					assignment_1,
					assessments,
					"creatorId"
				);

				expect(result).toHaveLength(1);
				expect(result[0].partialAssessments).toHaveLength(1);
				expect(result[0].partialAssessments[0].title).toEqual("A partial assessment");
				expect(result[0].partialAssessments[0].key).toBeDefined();
				expect(result[0].partialAssessments[0].assessmentId).toBeDefined();
			});

			it("No groupId or userId -> Throws BadRequestException", async () => {
				const repo = setup.app.get(AssessmentRepository);

				const assessments: AssessmentCreateDto[] = [
					{
						assignmentId: "wrong_id",
						isDraft: false,
						achievedPoints: 10
					}
				];

				await expect(async () => {
					await repo._createAssessmentEntities(assignment_1, assessments, "creatorId");
				}).rejects.toBeInstanceOf(BadRequestException);
			});

			it("Group is not registered -> Throws BadRequestException", async () => {
				const repo = setup.app.get(AssessmentRepository);

				const assessments: AssessmentCreateDto[] = [
					{
						assignmentId: "wrong_id",
						groupId: "not_registered_group_id",
						isDraft: false
					}
				];

				await expect(async () => {
					await repo._createAssessmentEntities(assignment_1, assessments, "creatorId");
				}).rejects.toBeInstanceOf(BadRequestException);
			});
		});
	});
});
