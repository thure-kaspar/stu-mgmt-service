import { AssessmentDto } from "../../../src/course/dto/assessment/assessment.dto";
import { AssignmentDto } from "../../../src/course/dto/assignment/assignment.dto";
import { CourseDto } from "../../../src/course/dto/course/course.dto";
import { GroupDto } from "../../../src/course/dto/group/group.dto";
import { AssessmentUserRelation } from "../../../src/course/entities/assessment-user-relation.entity";
import { Assessment } from "../../../src/course/entities/assessment.entity";
import { Assignment } from "../../../src/course/entities/assignment.entity";
import { Course } from "../../../src/course/entities/course.entity";
import { Group } from "../../../src/course/entities/group.entity";
import { Participant } from "../../../src/course/entities/participant.entity";
import { DtoFactory } from "../../../src/shared/dto-factory";
import { UserDto } from "../../../src/shared/dto/user.dto";
import { User } from "../../../src/shared/entities/user.entity";
import { CourseRole } from "../../../src/shared/enums";
import {
	ASSESSMENT_JAVA_EVALUATED_GROUP_1,
	ASSESSMENT_JAVA_TESTAT_USER_1
} from "../../mocks/assessments.mock";
import { ASSIGNMENT_JAVA_CLOSED } from "../../mocks/assignments.mock";
import { COURSE_INFO_2_2020, COURSE_JAVA_1920 } from "../../mocks/courses.mock";
import { GROUP_1_JAVA } from "../../mocks/groups/groups.mock";
import { USER_STUDENT_JAVA } from "../../mocks/users.mock";
import { convertToEntity, copy } from "../../utils/object-helper";

describe("DtoFactory", () => {
	describe("createCourseDto", () => {
		let course: Course;
		let expected: CourseDto;

		beforeEach(() => {
			course = convertToEntity(Course, COURSE_JAVA_1920);
			expected = copy(COURSE_JAVA_1920);
		});

		it("No relations loaded -> Returns Dto", () => {
			const result = DtoFactory.createCourseDto(course);
			expect(result).toEqual(expected);
		});
	});

	describe("createUserDto", () => {
		let user: User;
		let expected: UserDto;

		beforeEach(() => {
			user = convertToEntity(User, USER_STUDENT_JAVA);
			expected = copy(USER_STUDENT_JAVA);
		});

		it("No relations loaded -> Returns Dto", () => {
			const result = DtoFactory.createUserDto(user);
			expect(result).toEqual(expected);
		});

		it("Participant loaded -> Returns Dto with courses", () => {
			const course1 = convertToEntity(Course, COURSE_JAVA_1920);
			const course2 = convertToEntity(Course, COURSE_INFO_2_2020);

			const rel1 = new Participant();
			rel1.user = user;
			rel1.userId = user.id;
			rel1.course = course1;
			rel1.courseId = course1.id;
			rel1.role = CourseRole.STUDENT;

			const rel2 = new Participant();
			rel2.user = user;
			rel2.userId = user.id;
			rel2.course = course2;
			rel2.courseId = course2.id;
			rel2.role = CourseRole.TUTOR;

			user.participations = [rel1, rel2];
			expected.courses = [copy(COURSE_JAVA_1920), copy(COURSE_INFO_2_2020)];

			const result = DtoFactory.createUserDto(user);

			expect(result).toEqual(expected);
		});
	});

	describe("createGroupDto", () => {
		let group: Group;
		let expected: GroupDto;

		beforeEach(() => {
			group = convertToEntity(Group, GROUP_1_JAVA);
			expected = copy(GROUP_1_JAVA);

			// Password should be exluded
			expected.password = undefined;
		});

		it("No relation loaded -> Returns Dto", () => {
			const result = DtoFactory.createGroupDto(group);
			expect(result).toEqual(expected);
		});

		it("Password is not leaked", () => {
			const result = DtoFactory.createGroupDto(group);
			expect(result.password).toBeUndefined();
		});
	});

	describe("createAssignmentDto", () => {
		let assignment: Assignment;
		let expected: AssignmentDto;

		beforeEach(() => {
			assignment = convertToEntity(Assignment, ASSIGNMENT_JAVA_CLOSED);
			expected = copy(ASSIGNMENT_JAVA_CLOSED);
		});

		it("No relations loaded -> Returns Dto", () => {
			const result = DtoFactory.createAssignmentDto(assignment);
			expect(result).toEqual(expected);
		});
	});

	describe("createAssessmentDto", () => {
		let assessment: Assessment;
		let expected: AssessmentDto;

		it("No relations loaded + Assessment for group -> Returns Dto with groupId", () => {
			assessment = convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1);
			expected = copy(ASSESSMENT_JAVA_EVALUATED_GROUP_1);

			const result = DtoFactory.createAssessmentDto(assessment);

			expect(result.groupId).toBeTruthy();
			expect(result).toEqual(expected);
		});

		it("AssessmentUserRelation loaded + Assessment for single student -> Returns Dto with userId", () => {
			expected = copy(ASSESSMENT_JAVA_TESTAT_USER_1);
			assessment = convertToEntity(Assessment, ASSESSMENT_JAVA_TESTAT_USER_1);
			const rel = new AssessmentUserRelation();
			rel.assessmentId = assessment.id;
			rel.userId = expected.userId;
			assessment.assessmentUserRelations = [rel];

			const result = DtoFactory.createAssessmentDto(assessment);

			expect(result.userId).toBeTruthy();
			expect(result).toEqual(expected);
		});

		it("Group loaded -> Returns Dto with group", () => {
			assessment = convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1);
			assessment.group = convertToEntity(Group, GROUP_1_JAVA);
			expected = copy(ASSESSMENT_JAVA_EVALUATED_GROUP_1);
			expected.group = copy(GROUP_1_JAVA);
			expected.group.password = undefined;

			const result = DtoFactory.createAssessmentDto(assessment);

			expect(result).toEqual(expected);
		});
	});
});
