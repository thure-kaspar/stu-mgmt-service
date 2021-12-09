import { Assessment } from "../../../src/assessment/entities/assessment.entity";
import { AssessmentScoreChanged } from "../../../src/assessment/events/assessment-score-changed.event";
import { AssessmentRepository } from "../../../src/assessment/repositories/assessment.repository";
import { GroupDto } from "../../../src/course/dto/group/group.dto";
import { Assignment as AssignmentEntity } from "../../../src/course/entities/assignment.entity";
import { Participant } from "../../../src/course/entities/participant.entity";
import { AssignmentStateChanged } from "../../../src/course/events/assignment/assignment-state-changed.event";
import { UserJoinedGroupEvent } from "../../../src/course/events/group/user-joined-group.event";
import { Assignment } from "../../../src/course/models/assignment.model";
import { ParticipantRepository } from "../../../src/course/repositories/participant.repository";
import { GroupService } from "../../../src/course/services/group.service";
import { MailingListener } from "../../../src/mailing/services/mailing-listener.service";
import { MailingService } from "../../../src/mailing/services/mailing.service";
import { User } from "../../../src/shared/entities/user.entity";
import { AssignmentState, AssignmentType } from "../../../src/shared/enums";
import { Language } from "../../../src/shared/language";
import { UserSettings } from "../../../src/user/entities/user-settings.entity";
import { ASSESSMENT_JAVA_EVALUATED_GROUP_1 } from "../../mocks/assessments.mock";
import { ASSIGNMENT_JAVA2020_GROUP, ASSIGNMENT_JAVA_EVALUATED } from "../../mocks/assignments.mock";
import { GROUP_1_JAVA } from "../../mocks/groups/groups.mock";
import {
	PARTICIPANT_JAVA_1920_STUDENT,
	PARTICIPANT_JAVA_1920_STUDENT_2,
	PARTICIPANT_JAVA_1920_TUTOR
} from "../../mocks/participants/participants.mock";
import { USER_SETTINGS_MOCK } from "../../mocks/user-settings.mock";
import { USER_STUDENT_2_JAVA, USER_STUDENT_JAVA } from "../../mocks/users.mock";
import { convertToEntity, copy } from "../../utils/object-helper";

const mock_MailingService = (): Partial<MailingService> => ({
	send: jest.fn()
});

const mock_GroupService = (): Partial<GroupService> => ({
	getGroup: jest.fn()
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
	let groupService: GroupService;
	let participantRepository: ParticipantRepository;
	let assessmentRepository: AssessmentRepository;

	beforeEach(async () => {
		mailingService = mock_MailingService() as MailingService;
		participantRepository = mock_ParticipantRepository() as ParticipantRepository;
		assessmentRepository = mock_AssessmentRepository() as AssessmentRepository;
		groupService = mock_GroupService() as GroupService;
		sut = new MailingListener(
			mailingService,
			groupService,
			participantRepository,
			assessmentRepository
		);
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

		// TODO: jsxt.render call fails in tests
		xit("State = IN_PROGRESS and Type = HOMEWORK -> Calls ParticipantRepository to load participants", async () => {
			event = createEvent(AssignmentState.IN_PROGRESS, AssignmentType.HOMEWORK);
			await sut.onAssignmentStarted(event);
			expect(participantRepository.getParticipantsWithUserSettings).toBeCalledWith(
				event.assignment.courseId
			);
		});

		// TODO: jsxt.render call fails in tests
		xit("State = IN_PROGRESS and Type = HOMEWORK -> Calls MailingService to send mail", async () => {
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

	describe("onAssessmentScoreChanged", () => {
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

		it("Calls MailService to send mail", async () => {
			await sut.onAssessmentScoreChanged(event);
			expect(mailingService.send).toHaveBeenCalled();
		});
	});

	describe("onParticipantJoinedGroup", () => {
		let event: UserJoinedGroupEvent;
		let group: GroupDto;
		const courseId = "java-wise1920";

		beforeEach(() => {
			group = copy(GROUP_1_JAVA);
			group.members = [
				PARTICIPANT_JAVA_1920_STUDENT.participant,
				PARTICIPANT_JAVA_1920_TUTOR.participant,
				PARTICIPANT_JAVA_1920_STUDENT_2.participant
			];

			event = new UserJoinedGroupEvent(
				courseId,
				group.id,
				PARTICIPANT_JAVA_1920_STUDENT_2.participant.userId
			);

			groupService.getGroup = jest.fn().mockResolvedValue(group);
			participantRepository.getParticipantsWithUserSettings = jest
				.fn()
				.mockResolvedValueOnce([
					createMockParticipant(group.members[0].userId as any),
					createMockParticipant(group.members[1].userId as any),
					createMockParticipant(group.members[2].userId as any)
				]);
		});

		it("Uses the GroupService to load the group with its members", async () => {
			await sut.onParticipantJoinedGroup(event);
			expect(groupService.getGroup).toHaveBeenCalledWith(group.id);
		});

		it("Uses the ParticipantRepository to load UserSettings of members", async () => {
			await sut.onParticipantJoinedGroup(event);
			expect(participantRepository.getParticipantsWithUserSettings).toHaveBeenCalledWith(
				courseId,
				{ userIds: group.members.map(m => m.userId) }
			);
		});

		it("Sends a mail to all old members", async () => {
			await sut.onParticipantJoinedGroup(event);
			expect(mailingService.send).toHaveBeenCalledTimes(2);
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
			const { DE, EN } = sut.splitRecipientsByLanguage(participants);
			expect(DE.length).toEqual(3);
			expect(EN.length).toEqual(2);
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
			const result = sut.filterReceivers(participants, "ASSIGNMENT_STARTED");
			expect(result.length).toEqual(participants.length);
		});

		it("No UserSettings -> Returns all participants", () => {
			participants.forEach(p => (p.user.settings = null));
			const result = sut.filterReceivers(participants, "ASSIGNMENT_STARTED");
			expect(result.length).toEqual(participants.length);
		});

		it("Nobody allows emails -> Returns empty list", () => {
			participants.forEach(p => (p.user.settings.allowEmails = false));
			const result = sut.filterReceivers(participants, "ASSIGNMENT_STARTED");
			expect(result.length).toEqual(0);
		});

		// TODO: Event names do not match MailEvent type
		// it("All blacklists contain event -> Returns empty list", () => {
		// 	participants.forEach(
		// 		p =>
		// 			(p.user.settings.blacklistedEvents = {
		// 				["ASSIGNMENT_STARTED"]: true
		// 			})
		// 	);
		// 	const result = sut.filterReceivers(participants, "PARTICIPANT_JOINED_GROUP");
		// 	expect(result.length).toEqual(0);
		// });

		it("Participants without email -> Returns empty list", () => {
			participants.forEach(p => (p.user.email = null));
			const result = sut.filterReceivers(participants, "ASSIGNMENT_STARTED");
			expect(result.length).toEqual(0);
		});
	});

	describe("getPreferredLanguage", () => {
		let participant: Participant;

		beforeEach(() => {
			participant = convertToEntity(Participant, PARTICIPANT_JAVA_1920_STUDENT);
			participant.user = convertToEntity(User, USER_STUDENT_JAVA);
			participant.user.settings = USER_SETTINGS_MOCK[0].userSettings as UserSettings;
		});

		it("Returns preferred language, if it exists", () => {
			participant.user.settings.language = Language.EN;
			const result = sut.getPreferredLanguage(participant);
			expect(result).toEqual(Language.EN);
		});

		it("Uses Language.DE as fallback", () => {
			participant.user.settings = null;
			const result = sut.getPreferredLanguage(participant);
			expect(result).toEqual(Language.DE);
		});
	});
});
