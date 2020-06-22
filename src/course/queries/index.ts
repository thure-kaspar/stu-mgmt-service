import { CanJoinCourseHandler } from "./can-join-course/can-join-course.query";
import { GroupsWithAssignedEvaluatorHandler } from "./groups-with-assigned-evaluator/groups-with-assigned-evaluator.query";
import { UsersWithAssignedEvaluatorHandler } from "./users-with-assigned-evaluator/users-with-assigned-evaluator.query";

export const QueryHandlers = [
	CanJoinCourseHandler,
	GroupsWithAssignedEvaluatorHandler,
	UsersWithAssignedEvaluatorHandler,
];
