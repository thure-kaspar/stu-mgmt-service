import { ActivityController } from "../../activity/activity.controller";
import { SubmissionController } from "../../submission/submission.controller";
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
	GroupController,
	ActivityController,
	SubmissionController
];
