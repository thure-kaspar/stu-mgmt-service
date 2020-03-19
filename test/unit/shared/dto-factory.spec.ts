import { DtoFactory } from "../../../src/shared/dto-factory";
import { AssessmentDto } from "../../../src/shared/dto/assessment.dto";
import { AssignmentDto } from "../../../src/shared/dto/assignment.dto";
import { CourseDto } from "../../../src/shared/dto/course.dto";
import { GroupDto } from "../../../src/shared/dto/group.dto";
import { UserDto } from "../../../src/shared/dto/user.dto";
import { AssessmentUserRelation } from "../../../src/shared/entities/assessment-user-relation.entity";
import { Assessment } from "../../../src/shared/entities/assessment.entity";
import { Assignment } from "../../../src/shared/entities/assignment.entity";
import { CourseUserRelation } from "../../../src/shared/entities/course-user-relation.entity";
import { Course } from "../../../src/shared/entities/course.entity";
import { Group } from "../../../src/shared/entities/group.entity";
import { User } from "../../../src/shared/entities/user.entity";
import { CourseRole } from "../../../src/shared/enums";
import { ASSESSMENT_JAVA_EVALUATED_GROUP_1, ASSESSMENT_JAVA_TESTAT_USER_1 } from "../../mocks/assessments.mock";
import { ASSIGNMENT_JAVA_CLOSED, ASSIGNMENT_JAVA_EVALUATED, ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP } from "../../mocks/assignments.mock";
import { COURSE_INFO_2_2020, COURSE_JAVA_1920 } from "../../mocks/courses.mock";
import { GROUP_1_JAVA, GROUP_2_JAVA } from "../../mocks/groups.mock";
import { USER_STUDENT_2_JAVA, USER_STUDENT_JAVA } from "../../mocks/users.mock";
import { DtoToEntityConverter } from "../../utils/dto-to-entity-converter";
import { ObjectHelper } from "../../utils/object-helper";

describe("DtoFactory", () => {

	describe("createCourseDto", () => {

		let course: Course;
		let expected: CourseDto;

		beforeEach(() => {
			course = DtoToEntityConverter.getCourse(COURSE_JAVA_1920);
			expected = ObjectHelper.deepCopy(COURSE_JAVA_1920);

			// Password is never included 
			course.password = undefined;
			expected.password = undefined;
		});

		it("No relations loaded -> Returns Dto", () => {
			const result = DtoFactory.createCourseDto(course);
			expect(result).toEqual(expected);
		});

		it("Does not leak password", () => {
			course.password = "should_be_removed";
			const result = DtoFactory.createCourseDto(course);

			expect(result.password).toBeUndefined();
		});

		it("CourseUserRelations loaded -> Returns Dto with users", () => {
			// Mock CourseUserRelations (including loaded User)
			const rel1 = new CourseUserRelation();
			rel1.id = 1;
			rel1.user = DtoToEntityConverter.getUser(USER_STUDENT_JAVA);
			rel1.courseId = course.id,
			rel1.userId = rel1.user.id;
			rel1.role = CourseRole.STUDENT;

			const rel2 = new CourseUserRelation();
			rel2.id = 2;
			rel2.user = DtoToEntityConverter.getUser(USER_STUDENT_2_JAVA);
			rel2.userId = rel2.user.id;
			rel2.courseId = course.id,
			rel2.role = CourseRole.STUDENT;
			
			course.courseUserRelations = [rel1, rel2];

			// Extend expected with users
			expected.users = [{ ...USER_STUDENT_JAVA, courseRole: rel1.role }, {...USER_STUDENT_2_JAVA, courseRole: rel2.role }];
			const result = DtoFactory.createCourseDto(course);
			
			expect(result).toEqual(expected);
		});

		it("Assignments loaded -> Returns Dto with assignments", () => {
			const assignment1 = DtoToEntityConverter.getAssignment(ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP);
			const assignment2 = DtoToEntityConverter.getAssignment(ASSIGNMENT_JAVA_EVALUATED);
			course.assignments = [assignment1, assignment2];
			expected.assignments = [ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP, ASSIGNMENT_JAVA_EVALUATED];

			const result = DtoFactory.createCourseDto(course);

			expect(result).toEqual(expected);
		});

		it("Groups loaded -> Returns Dto with groups", () => {
			const group1 = DtoToEntityConverter.getGroup(GROUP_1_JAVA);
			const group2 = DtoToEntityConverter.getGroup(GROUP_2_JAVA);
			course.groups = [group1, group2];

			expected.groups = [ObjectHelper.deepCopy(GROUP_1_JAVA), ObjectHelper.deepCopy(GROUP_2_JAVA)];
			expected.groups[0].password = undefined;
			expected.groups[1].password = undefined;

			const result = DtoFactory.createCourseDto(course);
			expect(result).toEqual(expected);
		});

	});

	describe("createUserDto", () => {

		let user: User;
		let expected: UserDto;

		beforeEach(() => {
			user = DtoToEntityConverter.getUser(USER_STUDENT_JAVA);
			expected = ObjectHelper.deepCopy(USER_STUDENT_JAVA);
		});

		it("No relations loaded -> Returns Dto", () => {
			const result = DtoFactory.createUserDto(user);
			expect(result).toEqual(expected);
		});

		it("With courseRole -> Assigns courseRole to Dto", () => {
			const courseRole = CourseRole.STUDENT;
			expected.courseRole = courseRole;

			const result = DtoFactory.createUserDto(user, courseRole);

			expect(result).toEqual(expected);
			expect(result.courseRole).toEqual(courseRole);
		});

		it("CourseUserRelation loaded -> Returns Dto with courses", () => {
			const course1 = DtoToEntityConverter.getCourse(COURSE_JAVA_1920);
			const course2 = DtoToEntityConverter.getCourse(COURSE_INFO_2_2020);		

			const rel1 = new CourseUserRelation();
			rel1.user = user;
			rel1.userId = user.id;
			rel1.course = course1;
			rel1.courseId = course1.id;
			rel1.role = CourseRole.STUDENT;

			const rel2 = new CourseUserRelation();
			rel2.user = user;
			rel2.userId = user.id;
			rel2.course = course2;
			rel2.courseId = course2.id;
			rel2.role = CourseRole.TUTOR;

			user.courseUserRelations = [rel1, rel2];
			expected.courses = [ObjectHelper.deepCopy(COURSE_JAVA_1920), ObjectHelper.deepCopy(COURSE_INFO_2_2020)];
			expected.courses[0].password = undefined;
			expected.courses[1].password = undefined;

			const result = DtoFactory.createUserDto(user);
			
			expect(result).toEqual(expected);
		});

	});

	describe("createGroupDto", () => {

		let group: Group;
		let expected: GroupDto;

		beforeEach(() => {
			group = DtoToEntityConverter.getGroup(GROUP_1_JAVA);
			expected = ObjectHelper.deepCopy(GROUP_1_JAVA);

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

		it("Course loaded -> Returns Dto with course", () => {
			group.course = DtoToEntityConverter.getCourse(COURSE_JAVA_1920);
			expected.course = COURSE_JAVA_1920;
			expected.course.password = undefined;

			const result = DtoFactory.createGroupDto(group);
			expect(result).toEqual(expected);
		});
		
	});

	describe("createAssignmentDto", () => {

		let assignment: Assignment;
		let expected: AssignmentDto;

		beforeEach(() => {
			assignment = DtoToEntityConverter.getAssignment(ASSIGNMENT_JAVA_CLOSED);
			expected = ObjectHelper.deepCopy(ASSIGNMENT_JAVA_CLOSED);
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
			assessment = DtoToEntityConverter.getAssessment(ASSESSMENT_JAVA_EVALUATED_GROUP_1);
			expected = ObjectHelper.deepCopy(ASSESSMENT_JAVA_EVALUATED_GROUP_1);

			const result = DtoFactory.createAssessmentDto(assessment);

			expect(result.groupId).toBeTruthy();
			expect(result).toEqual(expected);
		});

		it("AssessmentUserRelation loaded + Assessment for single student -> Returns Dto with userId", () => {
			expected = ObjectHelper.deepCopy(ASSESSMENT_JAVA_TESTAT_USER_1);
			assessment = DtoToEntityConverter.getAssessment(ASSESSMENT_JAVA_TESTAT_USER_1);
			const rel = new AssessmentUserRelation();
			rel.assessmentId = assessment.id;
			rel.userId = expected.userId;
			assessment.assessmentUserRelations = [rel];

			const result = DtoFactory.createAssessmentDto(assessment);

			expect(result.userId).toBeTruthy();
			expect(result).toEqual(expected);
		});

		it("Group loaded -> Returns Dto with group", () => {
			assessment = DtoToEntityConverter.getAssessment(ASSESSMENT_JAVA_EVALUATED_GROUP_1);
			assessment.group = DtoToEntityConverter.getGroup(GROUP_1_JAVA);
			expected = ObjectHelper.deepCopy(ASSESSMENT_JAVA_EVALUATED_GROUP_1);
			expected.group = ObjectHelper.deepCopy(GROUP_1_JAVA);
			expected.group.password = undefined;

			const result = DtoFactory.createAssessmentDto(assessment);

			expect(result).toEqual(expected);
		});

	});

});
