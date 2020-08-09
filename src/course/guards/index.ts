import { CourseMemberGuard } from "./course-member.guard";
import { TeachingStaffGuard } from "./teaching-staff.guard";
import { GroupGuard } from "./group.guard";
import { SelectedParticipantGuard } from "./selected-participant.guard";
import { AssignmentGuard } from "./assignment.guard";

export const Guards = [
	AssignmentGuard,
	CourseMemberGuard,
	GroupGuard,
	SelectedParticipantGuard,
	TeachingStaffGuard
];
