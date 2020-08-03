import { AdmissionCriteraRepository } from "./admission-criteria.repository";
import { AssessmentAllocationRepository } from "./assessment-allocation.repository";
import { AssessmentUserRelationRepository } from "./assessment-user-relation.repository";
import { AssessmentRepository } from "./assessment.repository";
import { AssignmentTemplateRepository } from "./assignment-template.repository";
import { AssignmentRepository } from "./assignment.repository";
import { CourseConfigRepository } from "./course-config.repository";
import { ParticipantRepository } from "./participant.repository";
import { CourseRepository } from "./course.repository";
import { GroupEventRepository } from "./group-event.repository";
import { GroupSettingsRepository } from "./group-settings.repository";
import { GroupRepository } from "./group.repository";

export const Repositories = [
	AdmissionCriteraRepository,
	AssessmentAllocationRepository,
	AssessmentUserRelationRepository,
	AssessmentRepository,
	AssignmentTemplateRepository,
	AssignmentRepository,
	CourseConfigRepository,
	ParticipantRepository,
	CourseRepository,
	GroupEventRepository,
	GroupSettingsRepository,
	GroupRepository
];
