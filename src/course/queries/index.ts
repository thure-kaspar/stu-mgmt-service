import { CanJoinCourseHandler } from "./can-join-course/can-join-course.query";
import { CompareParticipantsListHandler } from "./compare-participants-list/compare-participants-list.query";
import { GroupsWithAssignedEvaluatorHandler } from "./groups-with-assigned-evaluator/groups-with-assigned-evaluator.query";
import { ParticipantsWithAssignedEvaluatorHandler } from "./participants-with-assigned-evaluator/participants-with-assigned-evaluator.query";

export const QueryHandlers = [
	CanJoinCourseHandler,
	GroupsWithAssignedEvaluatorHandler,
	ParticipantsWithAssignedEvaluatorHandler,
	CompareParticipantsListHandler
];
