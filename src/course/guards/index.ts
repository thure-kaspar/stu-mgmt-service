import { AssignmentGuard } from "./assignment.guard";
import { CourseByNameAndSemesterGuard } from "./course-by-name-semester.guard";
import { CourseMemberGuard } from "./course-member/course-member.guard";
import { GroupGuard } from "./group.guard";
import { ParticipantIdentityGuard } from "./identity.guard";
import { SelectedParticipantGuard } from "./selected-participant.guard";
import { TeachingStaffGuard } from "./teaching-staff.guard";

export const Guards = [
	AssignmentGuard,
	CourseByNameAndSemesterGuard,
	CourseMemberGuard,
	GroupGuard,
	ParticipantIdentityGuard,
	SelectedParticipantGuard,
	TeachingStaffGuard
];
