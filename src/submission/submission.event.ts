import { Assignment } from "../course/models/assignment.model";

export class SubmissionCreated {
	constructor(
		readonly assignment: Assignment,
		readonly userId: string,
		readonly groupId?: string
	) {}
}
