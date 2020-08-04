import { CourseMemberGuard } from "./course-member.guard";
import { CourseNotClosedGuard } from "./course-not-closed.guard";
import { TeachingStaffGuard } from "./teaching-staff.guard";

export const Guards = [
	CourseMemberGuard,
	CourseNotClosedGuard,
	TeachingStaffGuard
];
