import { ActivityService } from "../../activity/activity.service";
import { AssignmentRegistrationService } from "./assignment-registration.service";
import { AssignmentService } from "./assignment.service";
import { CourseConfigService } from "./course-config.service";
import { CourseParticipantsService } from "./course-participants.service";
import { CourseService } from "./course.service";
import { GroupService } from "./group.service";

export const Services = [
	ActivityService,
	AssignmentRegistrationService,
	AssignmentService,
	CourseConfigService,
	CourseParticipantsService,
	CourseService,
	GroupService
];
