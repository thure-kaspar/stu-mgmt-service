import { CourseMemberGuard } from "./course-member.guard";
import { TeachingStaffGuard } from "./teaching-staff.guard";
import { GroupGuard } from "./group.guard";
import { SelectedParticipantGuard } from "./selected-participant.guard";

export const Guards = [
	CourseMemberGuard,
	GroupGuard,
	SelectedParticipantGuard,
	TeachingStaffGuard
];
