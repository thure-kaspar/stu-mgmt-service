import { Participant } from "../../../src/course/entities/participant.entity";
import { Event } from "../../../src/course/events";
import { AssignmentStateChanged } from "../../../src/course/events/assignment/assignment-state-changed.event";
import { Assignment as AssignmentEntity } from "../../../src/course/entities/assignment.entity";
import { ParticipantRepository } from "../../../src/course/repositories/participant.repository";
import { MailingListener } from "../../../src/mailing/services/mailing-listener.service";
import { MailingService } from "../../../src/mailing/services/mailing.service";
import { User } from "../../../src/shared/entities/user.entity";
import { Language } from "../../../src/shared/language";
import { UserSettings } from "../../../src/user/entities/user-settings.entity";
import { convertToEntity } from "../../utils/object-helper";
import { ASSIGNMENT_JAVA2020_GROUP, ASSIGNMENT_JAVA_EVALUATED } from "../../mocks/assignments.mock";
import { AssignmentState, AssignmentType } from "../../../src/shared/enums";
import { AssessmentRepository } from "../../../src/assessment/repositories/assessment.repository";
import { AssessmentScoreChanged } from "../../../src/assessment/events/assessment-score-changed.event";
import { ASSESSMENT_JAVA_EVALUATED_GROUP_1 } from "../../mocks/assessments.mock";
import { USER_STUDENT_2_JAVA, USER_STUDENT_JAVA } from "../../mocks/users.mock";
import { Assessment } from "../../../src/assessment/entities/assessment.entity";

const mock_MailingService = (): Partial<MailingService> => ({
	send: jest.fn()
});

const mock_ParticipantRepository = (): Partial<ParticipantRepository> => ({
	getParticipantsWithUserSettings: jest
		.fn()
		.mockResolvedValue([
			createMockParticipant(0),
			createMockParticipant(1),
			createMockParticipant(2),
			createMockParticipant(3),
			createMockParticipant(4)
		])
});

const mock_AssessmentRepository = (): Partial<AssessmentRepository> => ({
	getAssessmentsForAssignment: jest.fn(),
	getAssessmentById: jest.fn()
});

function createMockParticipant(id: number): Participant {
	return {
		id,
		userId: id.toString(),
		user: {
			id: id.toString(),
			email: `user-${id}@mock.email`,
			settings: {
				language: Language.EN,
				allowEmails: true
			} as UserSettings
		} as User
	} as Participant;
}

describe("MailingService", () => {
	let sut: MailingListener;
	let mailingService: MailingService;
	let participantRepository: ParticipantRepository;
	let assessmentRepository: AssessmentRepository;

	beforeEach(async () => {
		mailingService = mock_MailingService() as MailingService;
		participantRepository = mock_ParticipantRepository() as ParticipantRepository;
		assessmentRepository = mock_AssessmentRepository() as AssessmentRepository;
		sut = new MailingListener(mailingService, participantRepository, assessmentRepository);
	});

	it("Should be defined", () => {
		expect(sut).toBeDefined();
	});

	describe("onAssignmentStarted", () => {
		let event: AssignmentStateChanged;

		const createEvent = (
			state: AssignmentState,
			type: AssignmentType
		): AssignmentStateChanged => {
			const assignmentEntity = convertToEntity(AssignmentEntity, ASSIGNMENT_JAVA2020_GROUP);
			assignmentEntity.state = state;
			assignmentEntity.type = type;
			const assignment = new Assignment(assignmentEntity);
			return new AssignmentStateChanged(assignment);
		};

		it("State = IN_PROGRESS and Type = HOMEWORK -> Calls ParticipantRepository to load participants", async () => {
			event = createEvent(AssignmentState.IN_PROGRESS, AssignmentType.HOMEWORK);
			await sut.onAssignmentStarted(event);
			expect(participantRepository.getParticipantsWithUserSettings).toBeCalledWith(
				event.assignment.courseId
			);
		});

		it("State = IN_PROGRESS and Type = HOMEWORK -> Calls MailingService to send mail", async () => {
			event = createEvent(AssignmentState.IN_PROGRESS, AssignmentType.HOMEWORK);
			await sut.onAssignmentStarted(event);
			// Only called once, because language is set to DE for all participants
			expect(mailingService.send).toHaveBeenCalledTimes(1);
		});

		it("State is not IN_PROGRESS -> No operation", async () => {
			event = createEvent(AssignmentState.INVISIBLE, AssignmentType.HOMEWORK);
			await sut.onAssignmentStarted(event);
			expect(participantRepository.getParticipantsWithUserSettings).not.toHaveBeenCalled();
		});

		it("Type is not HOMEWORK -> No operation", async () => {
			event = createEvent(AssignmentState.IN_PROGRESS, AssignmentType.TESTAT);
			await sut.onAssignmentStarted(event);
			expect(participantRepository.getParticipantsWithUserSettings).not.toHaveBeenCalled();
		});
	});

	describe.only("onAssessmentScoreChanged", () => {
		let event: AssessmentScoreChanged;
		const courseId = "java-wise1920";

		beforeEach(() => {
			event = new AssessmentScoreChanged(ASSESSMENT_JAVA_EVALUATED_GROUP_1.id, "user_id", {
				oldScore: 10,
				newScore: 11
			});

			assessmentRepository.getAssessmentById = jest.fn().mockImplementationOnce(() => {
				const assessment = convertToEntity(Assessment, ASSESSMENT_JAVA_EVALUATED_GROUP_1);
				assessment.assignment = convertToEntity(
					AssignmentEntity,
					ASSIGNMENT_JAVA_EVALUATED
				);
				assessment.assignment.courseId = courseId;
				assessment.assessmentUserRelations = [
					{ userId: USER_STUDENT_JAVA.id },
					{ userId: USER_STUDENT_2_JAVA.id }
				] as any;
				return assessment;
			});
		});

		it("Uses AssessmentRepository to retrieve assessment", async () => {
			await sut.onAssessmentScoreChanged(event);
			expect(assessmentRepository.getAssessmentById).toHaveBeenCalledWith(event.assessmentId);
		});

		it("Uses ParticipantsRepository to retrieve user settings", async () => {
			await sut.onAssessmentScoreChanged(event);
			expect(participantRepository.getParticipantsWithUserSettings).toHaveBeenCalledWith(
				courseId,
				{ userIds: [USER_STUDENT_JAVA.id, USER_STUDENT_2_JAVA.id] }
			);
		});

		it("Filters receivers for this event", async () => {
			sut.filterReceivers = jest.fn().mockReturnValueOnce([]);
			await sut.onAssessmentScoreChanged(event);
			expect(sut.filterReceivers).toHaveBeenCalled();
		});

		it("Splits receivers by language", async () => {
			sut.splitRecipientsByLanguage = jest.fn().mockReturnValueOnce([]);
			await sut.onAssessmentScoreChanged(event);
			expect(sut.splitRecipientsByLanguage).toHaveBeenCalled();
		});
	});

	describe("splitRecipientsByLanguage", () => {
		let participants: Participant[];

		beforeEach(() => {
			participants = [
				createMockParticipant(0),
				createMockParticipant(1),
				createMockParticipant(2),
				createMockParticipant(3),
				createMockParticipant(4)
			];

			participants[0].user.settings.language = Language.DE;
			participants[1].user.settings.language = Language.EN;
			participants[2].user.settings.language = Language.DE;
			participants[3].user.settings.language = Language.EN;
			participants[4].user.settings.language = "UNKNOWN" as any; // Should fallback to german
		});
		it("Split recipients by language", () => {
			const { recipientsDe, recipientsEn } = sut.splitRecipientsByLanguage(participants);
			expect(recipientsDe.length).toEqual(3);
			expect(recipientsEn.length).toEqual(2);
		});
	});

	describe("filterReceivers", () => {
		let participants: Participant[];

		beforeEach(() => {
			participants = [
				createMockParticipant(0),
				createMockParticipant(1),
				createMockParticipant(2),
				createMockParticipant(3),
				createMockParticipant(4)
			];
		});

		it("Emails allowed and event not blacklisted -> Returns all participants", () => {
			const result = sut.filterReceivers(participants, Event.ASSIGNMENT_STATE_CHANGED);
			expect(result.length).toEqual(participants.length);
		});

		it("No UserSettings -> Returns all participants", () => {
			participants.forEach(p => (p.user.settings = null));
			const result = sut.filterReceivers(participants, Event.ASSIGNMENT_STATE_CHANGED);
			expect(result.length).toEqual(participants.length);
		});

		it("Nobody allows emails -> Returns empty list", () => {
			participants.forEach(p => (p.user.settings.allowEmails = false));
			const result = sut.filterReceivers(participants, Event.ASSIGNMENT_STATE_CHANGED);
			expect(result.length).toEqual(0);
		});

		it("All blacklists contain event -> Returns empty list", () => {
			participants.forEach(
				p =>
					(p.user.settings.blacklistedEvents = {
						[Event.ASSIGNMENT_STATE_CHANGED]: true
					})
			);
			const result = sut.filterReceivers(participants, Event.ASSIGNMENT_STATE_CHANGED);
			expect(result.length).toEqual(0);
		});

		it("Participants without email -> Returns empty list", () => {
			participants.forEach(p => (p.user.email = null));
			const result = sut.filterReceivers(participants, Event.ASSIGNMENT_STATE_CHANGED);
			expect(result.length).toEqual(0);
		});
	});
});
