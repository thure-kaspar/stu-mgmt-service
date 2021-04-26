import { GroupsWithAssignedEvaluatorHandler } from "./groups-with-assigned-evaluator/groups-with-assigned-evaluator.query";
import { ParticipantsWithAssignedEvaluatorHandler } from "./participants-with-assigned-evaluator/participants-with-assigned-evaluator.query";

export const QueryHandlers = [
	GroupsWithAssignedEvaluatorHandler,
	ParticipantsWithAssignedEvaluatorHandler
];
