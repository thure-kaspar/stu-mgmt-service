import { Activity } from "../../src/activity/activity.entity";
import { AssessmentDto } from "../../src/assessment/dto/assessment.dto";
import { AssignmentDto } from "../../src/course/dto/assignment/assignment.dto";
import { ParticipantDto } from "../../src/course/dto/course-participant/participant.dto";
import { GroupDto } from "../../src/course/dto/group/group.dto";
import { RExportDto } from "../../src/export/recommender-export.dto";
import { RecommenderExportService } from "../../src/export/recommender-export.service";
import { RExportStudent } from "../../src/export/student-data.dto";
import { CourseRole } from "../../src/shared/enums";
import {
	ASSIGNMENT_JAVA_EVALUATED,
	ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE
} from "../mocks/assignments.mock";
import { ADMISSION_CRITERIA_MOCK } from "../mocks/course-config/admission-criteria.mock";
import { GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF } from "../mocks/course-config/group-settings.mock";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { TestSetup } from "../utils/e2e";

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
	groupsForAssignment: [
		{
			assignmentId: ASSIGNMENT_JAVA_EVALUATED.id,
			groups: [group("old A", [max, harry]), group("old B", [moritz, ronald])]
		},
		{
			assignmentId: ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE.id,
			groups: []
		}
	],
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
		it("Creates RecommenderExport", async () => {
			const result = await recommenderExportService.getRecommenderExportData("java-wise1920");
			expect(result.course).toBeDefined();
			expect(result.assignments).toHaveLength(8);
			expect(result.groupsForAssignment).toHaveLength(8);
			expect(result.groups).toHaveLength(3);

			expect(result.students).toHaveLength(4);
			expect(result.students[3].grades.length).toBeGreaterThan(0);

			expect(result).toMatchSnapshot();
		});
	});

	describe("_getAllAssessments", () => {
		it("Returns all assessments that belong the given assignmentIds", async () => {
			const assessments = await recommenderExportService._getAssessmentForAssignments([
				ASSIGNMENT_JAVA_EVALUATED.id,
				ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE.id
			]);

			expect(assessments).toHaveLength(3);
			expect(assessments[0].assignmentId).toEqual(ASSIGNMENT_JAVA_EVALUATED.id);
			expect(assessments[1].assignmentId).toEqual(ASSIGNMENT_JAVA_EVALUATED.id);
			expect(assessments[2].assignmentId).toEqual(ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE.id);

			expect(assessments[0].group.members).toHaveLength(2);
			expect(assessments[0].group).toBeDefined();

			expect(assessments[2].participant).toBeDefined();
			expect(assessments[2].group).toBeUndefined();
		});
	});

	describe("_mapRawData", () => {
		let result: RExportDto;

		beforeAll(() => {
			result = recommenderExportService._mapRawData(rawData);
		});

		it("Should return a RecommenderExport", () => {
			expect(result).toBeDefined();
			expect(result.assignments).toBeDefined();
			expect(result.course).toBeDefined();
			expect(result.groups).toBeDefined();
			expect(result.groupsForAssignment).toBeDefined();
			expect(result.students).toBeDefined();
		});

		it("Should contain all assignments", () => {
			expect(result.assignments).toHaveLength(2);
		});

		it("Should contain all students", () => {
			expect(result.students).toHaveLength(4);
		});

		it("Should contain current groups", () => {
			expect(result.groups).toHaveLength(2);
		});

		it("Should contain registered groups for each assignment", () => {
			expect(result.groupsForAssignment).toHaveLength(2);

			expect(result.groupsForAssignment[0].assignmentId).toEqual(
				ASSIGNMENT_JAVA_EVALUATED.id
			);
			expect(result.groupsForAssignment[1].assignmentId).toEqual(
				ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE.id
			);

			expect(result.groupsForAssignment[0].groups).toHaveLength(2);
		});

		it("Should contain activity data for each student", () => {
			expect(result.students[0].activity).toHaveLength(2);
		});

		it("Should contain grades of student for each assignment", () => {
			const grades = result.students[0].grades;
			expect(grades).toHaveLength(2);
			expect(grades[0].achievedPointsInPercent).toEqual(22);
			expect(grades[0].group).toBeDefined();
			expect(grades[0].group.members).toHaveLength(2);
		});

		it("Should contain admission status of each student", () => {
			expect(result.students[0].admissionStatus).toBeDefined();
		});

		it("Should contain submissions of each student", () => {
			expect(result.students[0].submissions).toHaveLength(3);
		});

		it("Should contain name of each student", () => {
			expect(result.students[0].userInfo.userId).toBeDefined();
			expect(result.students[0].userInfo.username).toEqual("Max");
			expect(result.students[0].userInfo.displayName).toBeDefined();
		});
	});

	describe("_addAssessmentsToStudents", () => {
		it("Adds grades for each assessment", () => {
			const assignmentMap = new Map<string, AssignmentDto>();
			assignmentMap.set(ASSIGNMENT_JAVA_EVALUATED.id, ASSIGNMENT_JAVA_EVALUATED);
			assignmentMap.set(
				ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE.id,
				ASSIGNMENT_JAVA_TESTAT_EVALUATED_SINGLE
			);

			const assessments: AssessmentDto[] = rawData.assessments;

			const rexportStudent = (p: ParticipantDto) => {
				return new RExportStudent({
					displayName: p.displayName,
					matrNr: p.matrNr,
					userId: p.userId,
					username: p.username
				});
			};

			const studentMap = new Map<string, RExportStudent>();
			studentMap.set(max.userId, rexportStudent(max));
			studentMap.set(moritz.userId, rexportStudent(moritz));
			studentMap.set(harry.userId, rexportStudent(harry));
			studentMap.set(ronald.userId, rexportStudent(ronald));

			recommenderExportService._addAssessmentsToStudents(
				assessments,
				assignmentMap,
				studentMap
			);

			const { grades } = studentMap.get(max.userId);

			expect(grades).toHaveLength(2);
			expect(grades[0].achievedPointsInPercent).toEqual(22);
			expect(grades[1].achievedPointsInPercent).toEqual(9);
		});
	});
});
