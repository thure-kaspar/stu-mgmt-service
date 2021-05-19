import { Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ASSIGNMENT_JAVA_EVALUATED } from "../../test/mocks/assignments.mock";
import { convertToEntity } from "../../test/utils/object-helper";
import { Assignment as AssignmentEntity } from "../course/entities/assignment.entity";
import { AssignmentStateChanged } from "../course/events/assignment/assignment-state-changed.event";
import { Assignment } from "../course/models/assignment.model";
import { MailingListener } from "./services/mailing-listener.service";
import { MailingService } from "./services/mailing.service";

@ApiTags("mail")
@Controller("mail")
export class MailingController {
	constructor(private mailingService: MailingService, private listener: MailingListener) {}

	@Post("simulateEvent")
	simulateEvent(): Promise<void> {
		const assignment = new Assignment(
			convertToEntity(AssignmentEntity, {
				courseId: "java-wise1920",
				...ASSIGNMENT_JAVA_EVALUATED
			})
		);

		return this.listener.onAssignmentEvaluated(new AssignmentStateChanged(assignment));
	}

	@Post("send")
	@ApiOperation({
		operationId: "send",
		summary: "Send mail.",
		description: "Sends the mail."
	})
	send(): Promise<void> {
		return null;
	}
}
