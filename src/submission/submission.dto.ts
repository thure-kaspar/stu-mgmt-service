import { AssignmentId } from "../course/entities/assignment.entity";
import { GroupId } from "../course/entities/group.entity";
import { LinkDto } from "../shared/dto/link.dto";
import { UserId } from "../shared/entities/user.entity";

export class SubmissionCreateDto {
	userId: UserId;
	groupId?: GroupId;
	links?: LinkDto[];
	payload?: any;
}

export class SubmissionDto {
	assignmentId: AssignmentId;
	userId: UserId;
	displayName: string;
	date: Date;
	groupId?: GroupId;
	groupName?: string;
	links?: LinkDto[];
	payload?: any;
}
