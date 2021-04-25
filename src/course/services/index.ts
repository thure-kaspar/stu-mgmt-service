import { AssessmentAllocationService } from "./assessment-allocation.service";
import { AssessmentService } from "./assessment.service";
import { AssignmentService } from "./assignment.service";
import { CourseConfigService } from "./course-config.service";
import { CourseParticipantsService } from "./course-participants.service";
import { CourseService } from "./course.service";
import { GroupService } from "./group.service";
import { AssignmentRegistrationService } from "./assignment-registration.service";
import { GroupMergeStrategy } from "./group-merge.strategy";

export const Services = [
	AssessmentAllocationService,
	AssessmentService,
	AssignmentRegistrationService,
	AssignmentService,
	CourseConfigService,
	CourseParticipantsService,
	CourseService,
	GroupService,
	GroupMergeStrategy
];
