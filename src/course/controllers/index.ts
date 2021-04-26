import { AssignmentRegistrationController } from "./assignment-registration.controller";
import { AssignmentController } from "./assignment.controller";
import { CourseConfigController } from "./config.controller";
import { CourseParticipantsController } from "./course-participants.controller";
import { CourseController } from "./course.controller";
import { GroupController } from "./group.controller";

export const Controllers = [
	AssignmentController,
	AssignmentRegistrationController,
	CourseConfigController,
	CourseParticipantsController,
	CourseController,
	GroupController
];
