import { AssessmentAllocationDto } from "../../src/course/dto/assessment-allocation/assessment-allocation.dto";
import { ASSIGNMENT_JAVA_IN_REVIEW } from "./assignments.mock";
import { USER_STUDENT_JAVA, USER_MGMT_ADMIN_JAVA_LECTURER } from "./users.mock";
import { GROUP_1_JAVA, GROUP_2_JAVA } from "./groups/groups.mock";

export const  ASSESSMENT_ALLOCATION_1: AssessmentAllocationDto = {
	assignmentId: ASSIGNMENT_JAVA_IN_REVIEW.id,
	assignedEvaluatorId: USER_STUDENT_JAVA.id,
	groupId: GROUP_1_JAVA.id
};

export const  ASSESSMENT_ALLOCATION_2: AssessmentAllocationDto = {
	assignmentId: ASSIGNMENT_JAVA_IN_REVIEW.id,
	assignedEvaluatorId: USER_MGMT_ADMIN_JAVA_LECTURER.id,
	groupId: GROUP_2_JAVA.id
};

export const ASSESSMENT_ALLOCATIONS_MOCK: AssessmentAllocationDto[] = [
	ASSESSMENT_ALLOCATION_1,
	ASSESSMENT_ALLOCATION_2
];
