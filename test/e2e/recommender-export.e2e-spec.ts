import { Activity } from "../../src/activity/activity.entity";
import { AssessmentDto } from "../../src/assessment/dto/assessment.dto";
import { ParticipantDto } from "../../src/course/dto/course-participant/participant.dto";
import { GroupDto } from "../../src/course/dto/group/group.dto";
import { RecommenderExportService } from "../../src/export/recommender-export.service";
import { CourseRole } from "../../src/shared/enums";
import {
	ASSIGNMENT_JAVA_EVALUATED,
	ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE
} from "../mocks/assignments.mock";
import { ADMISSION_CRITERIA_MOCK } from "../mocks/course-config/admission-criteria.mock";
import { GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF } from "../mocks/course-config/group-settings.mock";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { TestSetup } from "../utils/e2e";

describe("Recommender Export", () => {
	let setup: TestSetup;
	let recommenderExportService: RecommenderExportService;

	beforeAll(async () => {
		setup = await TestSetup.create();
		const activityRepo = setup.connection.getRepository(Activity);
		recommenderExportService = setup.app.get(RecommenderExportService);
		await setup.dbMockService.createAll();
		await activityRepo.insert([
			{
				courseId: "java-wise1920",
				userId: "3e52e822-4ebc-49c3-94e2-06ba447b5d1f",
				date: new Date(2022, 4, 4)
			},
			{
				courseId: "java-wise1920",
				userId: "3e52e822-4ebc-49c3-94e2-06ba447b5d1f",
				date: new Date(2022, 4, 14)
			}
		]);
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("getRecommenderExportData", () => {
		it("Exports RecommenderExport", async () => {
			const result = await recommenderExportService.getRecommenderExportData("java-wise1920");
			console.log(JSON.stringify(result, null, 4));
			expect(result.course).toBeDefined();
			expect(result.assignments.length).toBeGreaterThan(1);
			expect(result.groups.length).toBeGreaterThan(1);
		});
	});

	describe("_getAllAssessments", () => {
		it("abc", async () => {
			const assessments = await recommenderExportService._getAssessmentForAssignments([
				ASSIGNMENT_JAVA_EVALUATED.id,
				ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE.id
			]);

			expect(assessments).toHaveLength(3);
			expect(assessments[0].assessmentUserRelations).toHaveLength(2);
		});
	});

	describe("_mapRawData", () => {
		it("x", () => {
			const group = (name: string, members: ParticipantDto[]): GroupDto => ({
				id: "id-" + name,
				name,
				members
			});

			const student = (name: string): ParticipantDto => ({
				userId: "userId-" + name,
				displayName: name,
				username: name,
				role: CourseRole.STUDENT
			});

			const assessment = (
				id: string,
				assignmentId: string,
				target: { group?: GroupDto; participant?: ParticipantDto },
				achievedPoints?: number
			): AssessmentDto => ({
				id,
				assignmentId,
				achievedPoints,
				participant: target.participant,
				group: target.group,
				isDraft: false,
				creatorId: "creatorId"
			});

			const submission = (assignmentId: string, userId: string) => ({
				assignmentId,
				userId,
				date: new Date(2022)
			});

			const max = student("Max");
			const moritz = student("Moritz");
			const harry = student("Harry");
			const ronald = student("Ronald");

			const groupA = group("Group A", [max, moritz]);
			const groupB = group("Group B", [harry, ronald]);

			const rawData: Parameters<RecommenderExportService["_mapRawData"]>[0] = {
				course: {
					...COURSE_JAVA_1920,
					admissionCriteria: ADMISSION_CRITERIA_MOCK,
					groupSettings: GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF
				},
				students: [max, moritz, harry, ronald],
				assignments: [ASSIGNMENT_JAVA_EVALUATED, ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE],
				groups: [groupA, groupB],
				groupsForAssignment: {
					[ASSIGNMENT_JAVA_EVALUATED.id]: [
						group("old A", [max, harry]),
						group("old B", [moritz, ronald])
					],
					[ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE.id]: []
				},
				activity: [
					{
						user: max,
						dates: [new Date(2022, 1, 1), new Date(2022, 1, 10)]
					},
					{
						user: moritz,
						dates: []
					},
					{
						user: harry,
						dates: [new Date(2022, 1, 5), new Date(2022, 2, 15)]
					},
					{
						user: ronald,
						dates: [new Date(2022, 2, 1)]
					}
				],
				assessments: [
					assessment("assessment A", ASSIGNMENT_JAVA_EVALUATED.id, { group: groupA }, 22),
					assessment("assessment B", ASSIGNMENT_JAVA_EVALUATED.id, { group: groupB }, 44),
					assessment(
						"assessment Max",
						ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE.id,
						{ participant: max },
						9
					),
					assessment(
						"assessment Harry",
						ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE.id,
						{ participant: harry },
						27
					)
				],
				submissions: [
					submission(ASSIGNMENT_JAVA_EVALUATED.id, max.userId),
					submission(ASSIGNMENT_JAVA_EVALUATED.id, moritz.userId),
					submission(ASSIGNMENT_JAVA_EVALUATED.id, max.userId),
					submission(ASSIGNMENT_JAVA_EVALUATED.id, harry.userId),
					submission(ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE.id, max.userId),
					submission(ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE.id, moritz.userId)
				],
				admissionStatus: [
					{
						participant: max,
						fulfillsAdmissionCriteria: true,
						hasAdmission: true,
						hasAdmissionFromPreviousSemester: false,
						results: []
					}
				]
			};

			const result = recommenderExportService._mapRawData(rawData);

			expect(result).toBeDefined();
			expect(result.assignments).toHaveLength(2);
			expect(result.students).toHaveLength(4);
			expect(result.groups).toHaveLength(2);
			expect(result.groupsForAssignment[ASSIGNMENT_JAVA_EVALUATED.id]).toHaveLength(2);
			expect(result.groupsForAssignment[ASSIGNMENT_JAVA_EVALUATED.id][0].name).toEqual(
				"old A"
			);
			expect(result.groupsForAssignment[ASSIGNMENT_JAVA_EVALUATED.id][1].name).toEqual(
				"old B"
			);
		});
	});
});
