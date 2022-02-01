import { AssessmentDto } from "../../../src/assessment/dto/assessment.dto";
import { AssessmentUserRelation } from "../../../src/assessment/entities/assessment-user-relation.entity";
import { Assessment } from "../../../src/assessment/entities/assessment.entity";
import { PartialAssessment } from "../../../src/assessment/entities/partial-assessment.entity";
import { AssessmentRepository } from "../../../src/assessment/repositories/assessment.repository";
import { AssignmentState, AssignmentType, CollaborationType } from "../../../src/shared/enums";
import { GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF } from "../../mocks/course-config/group-settings.mock";
import { COURSE_JAVA_1920 } from "../../mocks/courses.mock";
import {
	USER_MGMT_ADMIN_JAVA_LECTURER,
	USER_STUDENT_2_JAVA,
	USER_STUDENT_JAVA,
	USER_SYSTEM_ADMIN
} from "../../mocks/users.mock";
import { StudentMgmtDbEntities } from "../../utils/demo-db";
import { TestSetup } from "../../utils/e2e";

const courseId = COURSE_JAVA_1920.id;
const assessmentId = "5ddc19f9-5dac-4bad-a7ac-845ef6adbf49";
const assignmentId = "c916208c-a1b2-4a69-bfef-0199d41436ce";

describe("convertGroupToIndividualAssessment", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
	});

	beforeEach(async () => {
		await setup.clearDb();

		const entities = new StudentMgmtDbEntities({
			users: [
				USER_STUDENT_JAVA,
				USER_STUDENT_2_JAVA,
				USER_MGMT_ADMIN_JAVA_LECTURER,
				USER_SYSTEM_ADMIN
			],
			courses: [
				{
					data: COURSE_JAVA_1920,
					config: {
						admissionCriteria: { rules: [] },
						groupSettings: GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF
					},
					participants: {
						lecturers: [USER_MGMT_ADMIN_JAVA_LECTURER.username],
						students: [USER_STUDENT_JAVA.username, USER_STUDENT_2_JAVA.username]
					},
					groups: [
						{
							id: "27358016-b0db-4ba0-843d-ec47910b1b6a",
							name: "Group 1",
							members: [USER_STUDENT_JAVA.username, USER_STUDENT_2_JAVA.username]
						}
					],
					assignments: [
						{
							id: assignmentId,
							collaboration: CollaborationType.GROUP,
							name: "Assignment 01",
							type: AssignmentType.HOMEWORK,
							state: AssignmentState.IN_REVIEW,
							points: 10,
							assessments: [
								{
									id: assessmentId,
									creator: USER_MGMT_ADMIN_JAVA_LECTURER.username,
									updateDate: new Date(2022, 1, 1),
									creationDate: new Date(2022, 1, 1),
									isDraft: false,
									comment: "Lorem ipsum...",
									achievedPoints: 7,
									target: {
										group: "Group 1"
									},
									partialAssessments: [
										{
											draftOnly: false,
											title: "A partial assessment",
											key: "myKey",
											comment: "Lorem ipsum...",
											points: 1
										}
									]
								}
							]
						}
					]
				}
			]
		});

		await setup.dbMockService.createAll(entities);
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("E2E", () => {
		it("Splits assessment into multiple assessments", () => {
			return setup
				.request()
				.post(
					`/courses/${courseId}/assignments/${assignmentId}/assessments/${assessmentId}/convert-to-individual`
				)
				.expect(201)
				.expect(({ body }) => {
					const result = body as AssessmentDto[];
					expect(result).toHaveLength(2);

					const [assessment_1, assessment_2] = result;

					expect(assessment_1.id).not.toEqual(assessmentId);
					expect(assessment_2.id).not.toEqual(assessmentId);

					expect(assessment_1.userId).toEqual(USER_STUDENT_JAVA.id);
					expect(assessment_2.userId).toEqual(USER_STUDENT_2_JAVA.id);

					expect(assessment_1.partialAssessments).toHaveLength(1);
					expect(assessment_2.partialAssessments).toHaveLength(1);

					expect(assessment_1.creatorId).toEqual(USER_SYSTEM_ADMIN.id);
				});
		});
	});

	describe("AssessmentRepository", () => {
		let assessmentRepository: AssessmentRepository;

		beforeEach(() => {
			assessmentRepository = setup.app.get(AssessmentRepository);
		});

		it("Should be defined", () => {
			expect(assessmentRepository).toBeDefined();
		});

		it("Group assessment should be removed afterwards", async () => {
			const individualAssessments =
				await assessmentRepository.convertGroupToIndividualAssessment(
					assessmentId,
					USER_SYSTEM_ADMIN.id
				);

			expect(individualAssessments).toHaveLength(2);

			const removedAssessment = await assessmentRepository.findOne(assessmentId);

			expect(removedAssessment).toBeUndefined();
		});

		describe("_splitAssessment", () => {
			it("Sets ids and dates to undefined", () => {
				const assessment = new Assessment();
				const relation = new AssessmentUserRelation();
				relation.assessmentId = "assessmentId";
				relation.userId = "userId";
				relation.assignmentId = "assignmentId";

				assessment.assessmentUserRelations = [relation];
				assessment.id = "assessmentId";
				assessment.groupId = "groupId";
				assessment.lastUpdatedById = "lastUpdatedById";
				assessment.updateDate = new Date(2022);
				assessment.creatorId = "creatorId";
				assessment.creationDate = new Date(2022);
				assessment.partialAssessments = [
					{
						id: 123,
						assessmentId: "assessmentId"
					} as PartialAssessment
				];

				const [splitAssessment] = assessmentRepository._splitAssessment(
					assessment,
					"newCreatorId"
				);

				expect(splitAssessment.creatorId).toEqual("newCreatorId");
				expect(splitAssessment.assessmentUserRelations[0].userId).toEqual(relation.userId);
				expect(splitAssessment.assessmentUserRelations[0].assignmentId).toEqual(
					relation.assignmentId
				);

				expect(splitAssessment.id).toBeUndefined();
				expect(splitAssessment.groupId).toBeUndefined();
				expect(splitAssessment.lastUpdatedById).toBeUndefined();
				expect(splitAssessment.updateDate).toBeUndefined();
				expect(splitAssessment.creationDate).toBeUndefined();
				expect(splitAssessment.partialAssessments[0].id).toBeUndefined();
				expect(splitAssessment.partialAssessments[0].assessmentId).toBeUndefined();
				expect(splitAssessment.assessmentUserRelations[0].assessmentId).toBeUndefined();
			});
		});
	});
});
