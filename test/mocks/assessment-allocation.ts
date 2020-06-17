import { AssessmentAllocationDto } from "../../src/course/dto/assessment-allocation/assessment-allocation.dto";
import { ASSIGNMENT_JAVA_IN_REVIEW, ASSIGNMENT_JAVA_INVISIBLE } from "./assignments.mock";
import { USER_STUDENT_JAVA, USER_MGMT_ADMIN_JAVA_LECTURER } from "./users.mock";
import { GROUP_1_JAVA, GROUP_2_JAVA } from "./groups/groups.mock";

export const ASSESSMENT_ALLOCATION_1_ASSIGNMENT_JAVA_IN_REVIEW: AssessmentAllocationDto = {
	assignmentId: ASSIGNMENT_JAVA_IN_REVIEW.id,
	assignedEvaluatorId: USER_STUDENT_JAVA.id,
	groupId: GROUP_1_JAVA.id
};

export const ASSESSMENT_ALLOCATION_2__ASSIGNMENT_JAVA_IN_REVIEW: AssessmentAllocationDto = {
	assignmentId: ASSIGNMENT_JAVA_IN_REVIEW.id,
	assignedEvaluatorId: USER_MGMT_ADMIN_JAVA_LECTURER.id,
	groupId: GROUP_2_JAVA.id
};

export const ASSESSMENT_ALLOCATION_3_ASSIGNMENT_JAVA_INVISIBLE: AssessmentAllocationDto = {
	assignmentId: ASSIGNMENT_JAVA_INVISIBLE.id,
	assignedEvaluatorId: USER_MGMT_ADMIN_JAVA_LECTURER.id,
	groupId: GROUP_2_JAVA.id
};

export const ASSESSMENT_ALLOCATIONS_MOCK: AssessmentAllocationDto[] = [
	ASSESSMENT_ALLOCATION_1_ASSIGNMENT_JAVA_IN_REVIEW,
	ASSESSMENT_ALLOCATION_2__ASSIGNMENT_JAVA_IN_REVIEW,
	ASSESSMENT_ALLOCATION_3_ASSIGNMENT_JAVA_INVISIBLE
];
