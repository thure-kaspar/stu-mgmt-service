import { AssessmentUserRelationRepository } from "../../assessment/repositories/assessment-user-relation.repository";
import { AdmissionCriteriaRepository } from "./admission-criteria.repository";
import { AdmissionFromPreviousSemesterRepository } from "./admission-from-previous-semester.repository";
import { AssignmentRegistrationRepository } from "./assignment-registration.repository";
import { AssignmentTemplateRepository } from "./assignment-template.repository";
import { AssignmentRepository } from "./assignment.repository";
import { CourseConfigRepository } from "./course-config.repository";
import { CourseRepository } from "./course.repository";
import { GroupEventRepository } from "./group-event.repository";
import { GroupSettingsRepository } from "./group-settings.repository";
import { GroupRepository } from "./group.repository";
import { ParticipantRepository } from "./participant.repository";

export const Repositories = [
	AdmissionCriteriaRepository,
	AdmissionFromPreviousSemesterRepository,
	AssessmentUserRelationRepository,
	AssignmentTemplateRepository,
	AssignmentRepository,
	AssignmentRegistrationRepository,
	CourseConfigRepository,
	ParticipantRepository,
	CourseRepository,
	GroupEventRepository,
	GroupSettingsRepository,
	GroupRepository
];
