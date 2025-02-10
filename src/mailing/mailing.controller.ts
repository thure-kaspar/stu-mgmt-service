import {
	BadRequestException,
	Body,
	Controller,
	NotImplementedException,
	Post,
	UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Config } from "../.config/config";
import { environment } from "../.config/environment";
import { Roles } from "../auth/decorators/roles.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { RoleGuard } from "../auth/guards/role.guard";
import { UserRole } from "../shared/enums";
import { Language } from "../shared/language";
import { MailEvent, MailFactory } from "./mail-templates";
import { Mail } from "./mail.model";
// import { ASSESSMENT_JAVA_EVALUATED_GROUP_1 } from "../../test/mocks/assessments.mock";
// import { ASSIGNMENT_JAVA_EVALUATED } from "../../test/mocks/assignments.mock";
// import { GROUP_1_JAVA } from "../../test/mocks/groups/groups.mock";
// import {
// 	USER_STUDENT_2_JAVA,
// 	USER_STUDENT_3_JAVA_TUTOR,
// 	USER_STUDENT_JAVA
// } from "../../test/mocks/users.mock";
// import { convertToEntity } from "../../test/utils/object-helper";
// import { Assignment as AssignmentEntity } from "../course/entities/assignment.entity";
// import { AssignmentStateChanged } from "../course/events/assignment/assignment-state-changed.event";
// import { UserJoinedGroupEvent } from "../course/events/group/user-joined-group.event";
// import { UserLeftGroupEvent } from "../course/events/group/user-left-group.event";
// import { Assignment } from "../course/models/assignment.model";
import { MailingListener } from "./services/mailing-listener.service";
import { MailingService } from "./services/mailing.service";
import { Public } from "nest-keycloak-connect";

@ApiBearerAuth()
@ApiTags("mail")
@Controller("mail")
@Public(environment.is("development", "demo", "testing"))
export class MailingController {
	constructor(private mailingService: MailingService, private listener: MailingListener) {}

	@ApiOperation({
		operationId: "simulateEvent",
		summary: "DEVELOPMENT ONLY.",
		description: "Convenience method to trigger events that trigger email notifications."
	})
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

		// return this.listener.onSubmissionCreated({
		// 	assignment,
		// 	userId: USER_STUDENT_JAVA.id,
		// 	groupId: GROUP_1_JAVA.id
		// });

		// const assessment = ASSESSMENT_JAVA_EVALUATED_GROUP_1;
		// const user = USER_STUDENT_3_JAVA_TUTOR;
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
		// return this.listener.onParticipantLeftGroup(event);

		return null;
	}

	@ApiOperation({
		operationId: "sendTestMail",
		summary: "Send test email",
		description: `ADMIN ONLY. Sends a test email to the given email addresses.

		Languages: [DE, EN]

		MailEvents: [
			ASSIGNMENT_STARTED,
			ASSIGNMENT_EVALUATED,
			ASSESSMENT_SCORE_CHANGED,
			PARTICIPANT_JOINED_GROUP,
			PARTICIPANT_LEFT_GROUP,
			SUBMISSION_CREATED
		]`
	})
	@Post("sendTestMail")
	@Roles(UserRole.MGMT_ADMIN, UserRole.SYSTEM_ADMIN)
	@ApiBody({
		required: true,
		schema: {
			properties: {
				receiverEmails: { minLength: 1, items: { type: "string" } },
				language: { enum: [Language.DE, Language.EN], default: Language.DE },
				mailEvent: {
					enum: [
						"ASSIGNMENT_STARTED",
						"ASSIGNMENT_EVALUATED",
						"ASSESSMENT_SCORE_CHANGED",
						"PARTICIPANT_JOINED_GROUP",
						"PARTICIPANT_LEFT_GROUP",
						"SUBMISSION_CREATED"
					]
				}
			}
		}
	})
	@UseGuards(AuthGuard, RoleGuard)
	async sendTestMail(
		@Body() body: { receiverEmails: string[]; language?: Language; mailEvent?: MailEvent }
	): Promise<unknown> {
		if (!body || !body.receiverEmails || body.receiverEmails.length == 0) {
			throw new BadRequestException("Request body is missing a 'receiverEmail'.");
		}

		if (!Config.get().mailing.enabled) {
			throw new BadRequestException("Mailing is not enabled.");
		}

		const language = body.language ?? Language.DE;
		const bcc = body.receiverEmails;
		let mail: Mail = null;

		const courseId = "email-example-course";
		const courseName = "Email Example Course";
		const assignmentId = "assignment_id_123";
		const assessmentId = "assessment_id_123";
		const assignmentName = "Email Example Assignment";

		switch (body.mailEvent) {
			case "ASSESSMENT_SCORE_CHANGED":
				mail = MailFactory.create("ASSESSMENT_SCORE_CHANGED", bcc, language, {
					assessment: { id: assignmentId },
					assignment: { courseId, name: courseName, id: assignmentId }
				});
				break;

			case "ASSIGNMENT_EVALUATED":
				mail = MailFactory.create("ASSIGNMENT_EVALUATED", bcc, language, {
					assessmentId,
					courseId,
					assignment: { id: assignmentId, name: assignmentName }
				});
				break;

			case "ASSIGNMENT_STARTED":
				mail = MailFactory.create("ASSIGNMENT_STARTED", bcc, language, {
					courseId,
					assignmentName,
					endDate: new Date(2022, 3, 20)
				});
				break;

			case "PARTICIPANT_JOINED_GROUP":
				mail = MailFactory.create("PARTICIPANT_JOINED_GROUP", bcc, language, {
					courseId,
					participantName: "Max Mustermann",
					participantEmail: "Max@Mustermann.email"
				});
				break;

			case "SUBMISSION_CREATED":
				mail = MailFactory.create("SUBMISSION_CREATED", bcc, language, {
					assignmentName,
					courseId,
					groupName: "Email Example Group"
				});
				break;

			default:
				mail = new Mail(bcc);
				mail.subject = "Student Management System - Test Email";
				mail.text = "This is a test email. (Text)";
				mail.html = "<a href='#'>This is a test email. (HTML)</a>";
				break;
		}

		await this.mailingService.send(mail);

		return {
			message: `An email has been send to: [${body.receiverEmails.join(", ")}]`
		};
	}
}
