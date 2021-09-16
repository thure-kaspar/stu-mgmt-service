import { Controller, NotImplementedException, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import c = require("config");
import { ASSESSMENT_JAVA_EVALUATED_GROUP_1 } from "../../test/mocks/assessments.mock";
import { ASSIGNMENT_JAVA_EVALUATED } from "../../test/mocks/assignments.mock";
import { GROUP_1_JAVA } from "../../test/mocks/groups/groups.mock";
import { USER_STUDENT_2_JAVA, USER_STUDENT_3_JAVA_TUTOR } from "../../test/mocks/users.mock";
import { convertToEntity } from "../../test/utils/object-helper";
import { environment } from "../.config/environment";
import { Assignment as AssignmentEntity } from "../course/entities/assignment.entity";
import { AssignmentStateChanged } from "../course/events/assignment/assignment-state-changed.event";
import { UserJoinedGroupEvent } from "../course/events/group/user-joined-group.event";
import { UserLeftGroupEvent } from "../course/events/group/user-left-group.event";
import { Assignment } from "../course/models/assignment.model";
import { MailingListener } from "./services/mailing-listener.service";
import { MailingService } from "./services/mailing.service";

@ApiTags("mail")
@Controller("mail")
export class MailingController {
	constructor(private mailingService: MailingService, private listener: MailingListener) {}

	@Post("simulateEvent")
	simulateEvent(): Promise<void> {
		if (!environment.is("development")) {
			throw new NotImplementedException("Only available in development environment.");
		}

		// const assignment = new Assignment(
		// 	convertToEntity(AssignmentEntity, {
		// 		courseId: "java-wise1920",
		// 		...ASSIGNMENT_JAVA_EVALUATED
		// 	})
		// );

		// return this.listener.onAssignmentEvaluated(new AssignmentStateChanged(assignment));

		// const assessment = ASSESSMENT_JAVA_EVALUATED_GROUP_1;
		//const user = USER_STUDENT_3_JAVA_TUTOR;
		// return this.listener.onAssessmentScoreChanged({
		// 	assessmentId: assessment.id,
		// 	userId: user.id,
		// 	payload: {
		// 		newScore: 10,
		// 		oldScore: 9
		// 	}
		// });

		// const group = GROUP_1_JAVA;
		// const user = USER_STUDENT_2_JAVA;
		// const event = new UserJoinedGroupEvent("java-wise1920", group.id, user.id);
		// return this.listener.onParticipantJoinedGroup(event);

		// const group = GROUP_1_JAVA;
		// const user = USER_STUDENT_2_JAVA;
		// const event = new UserLeftGroupEvent("java-wise1920", group.id, user.id);
		// return this.listener.onParticipantLeftGroup(event);#

		return null;
	}
}
