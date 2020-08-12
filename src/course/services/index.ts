import { AssessmentAllocationService } from "./assessment-allocation.service";
import { AssessmentService } from "./assessment.service";
import { AssignmentService } from "./assignment.service";
import { CourseConfigService } from "./course-config.service";
import { CourseParticipantsService } from "./course-participants.service";
import { CourseService } from "./course.service";
import { GroupService } from "./group.service";
import { NotificationService } from "./notification.service";
import { AssignmentRegistrationService } from "./assignment-registration.service";

export const Services = [
	AssessmentAllocationService,
	AssessmentService,
	AssignmentRegistrationService,
	AssignmentService,
	CourseConfigService,
	CourseParticipantsService,
	CourseService,
	GroupService,
	NotificationService
];
