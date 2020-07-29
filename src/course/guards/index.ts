import { CourseMemberGuard } from "./course-member.guard";
import { TeachingStaffGuard } from "./teaching-staff.guard";

export const Guards = [
	CourseMemberGuard,
	TeachingStaffGuard
];
