import { AssignmentDto } from "../../course/dto/assignment/assignment.dto";
import { GroupDto } from "../../course/dto/group/group.dto";

export class AssignmentGroupTuple {
	assignment: AssignmentDto;
	group: GroupDto;
}
