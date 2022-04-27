import { Injectable, Logger } from "@nestjs/common";
import { ofType, Saga } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Assessment } from "../../assessment/entities/assessment.entity";
import { AssessmentScoreChanged } from "../../assessment/events/assessment-score-changed.event";
import { AssessmentRepository } from "../../assessment/repositories/assessment.repository";
import { GroupDto } from "../../course/dto/group/group.dto";
import { Participant } from "../../course/entities/participant.entity";
import { AssignmentStateChanged } from "../../course/events/assignment/assignment-state-changed.event";
import { UserJoinedGroupEvent } from "../../course/events/group/user-joined-group.event";
import { UserLeftGroupEvent } from "../../course/events/group/user-left-group.event";
import { AssignmentRegistrationRepository } from "../../course/repositories/assignment-registration.repository";
import { ParticipantRepository } from "../../course/repositories/participant.repository";
import { GroupService } from "../../course/services/group.service";
import { AssignmentState, AssignmentType } from "../../shared/enums";
import { Language } from "../../shared/language";
import { SubmissionCreated } from "../../submission/submission.event";
import { MailEvent, MailFactory } from "../mail-templates";
import { Mail } from "../mail.model";
import { MailingService } from "./mailing.service";

function getEmails(participants: Participant[]): string[] {
	return participants.map(p => p.user.email);
}

type RecipientsByLanguage = { [language in Language]: Participant[] };

@Injectable()
export class MailingListener {
	@Saga()
	assignmentStarted$ = (events$: Observable<unknown>): Observable<unknown> => {
		return events$.pipe(
			ofType(AssignmentStateChanged),
			tap(async event => {
				this.onAssignmentStarted(event);
			}),
			map(() => undefined)
		);
	};

	@Saga()
	assignmentEvaluated$ = (events$: Observable<unknown>): Observable<unknown> => {
		return events$.pipe(
			ofType(AssignmentStateChanged),
			tap(async event => {
				this.onAssignmentEvaluated(event);
			}),
			map(() => undefined)
		);
	};

	@Saga()
	assessmentScoreChanged$ = (events$: Observable<unknown>): Observable<unknown> => {
		return events$.pipe(
			ofType(AssessmentScoreChanged),
			tap(async event => {
				this.onAssessmentScoreChanged(event);
			}),
			map(() => undefined)
		);
	};

	@Saga()
	participantJoinedGroup$ = (events$: Observable<unknown>): Observable<unknown> => {
		return events$.pipe(
			ofType(UserJoinedGroupEvent),
			tap(async event => {
				this.onParticipantJoinedGroup(event);
			}),
			map(() => undefined)
		);
	};

	@Saga()
	participantLeftGroup$ = (events$: Observable<unknown>): Observable<unknown> => {
		return events$.pipe(
			ofType(UserLeftGroupEvent),
			tap(async event => {
				this.onParticipantLeftGroup(event);
			}),
			map(() => undefined)
		);
	};

	@Saga()
	submissionCreated$ = (events$: Observable<unknown>): Observable<unknown> => {
		return events$.pipe(
			ofType(SubmissionCreated),
			tap(async event => {
				this.onSubmissionCreated(event);
			}),
			map(() => undefined)
		);
	};

	private logger = new Logger("MailingListener");

	constructor(
		private mailingService: MailingService,
		private groupService: GroupService,
		@InjectRepository(ParticipantRepository)
		private participantRepository: ParticipantRepository,
		@InjectRepository(AssessmentRepository)
		private assessmentRepository: AssessmentRepository,
		private registrations: AssignmentRegistrationRepository
	) {}

	async onAssignmentStarted({ assignment }: AssignmentStateChanged): Promise<void> {
		if (
			assignment.state === AssignmentState.IN_PROGRESS &&
			assignment.type === AssignmentType.HOMEWORK
		) {
			const participants = await this.participantRepository.getParticipantsWithUserSettings(
				assignment.courseId
			);

			const interestedParticipants = this.filterReceivers(participants, "ASSIGNMENT_STARTED");

			const recipients = this.splitRecipientsByLanguage(interestedParticipants);

			const mailPromises = this.createMailPromises(recipients, language => {
				return MailFactory.create(
					"ASSIGNMENT_STARTED",
					getEmails(recipients[language]),
					language,
					{
						assignmentName: assignment.name,
						courseId: assignment.courseId,
						endDate: assignment.endDate
					}
				);
			});

			await Promise.all(mailPromises);
		}
	}

	async onAssignmentEvaluated({ assignment }: AssignmentStateChanged): Promise<void> {
		if (assignment.state === AssignmentState.EVALUATED) {
			const [participants, [assessments]] = await Promise.all([
				this.participantRepository.getParticipantsWithUserSettings(assignment.courseId),
				this.assessmentRepository.getAssessmentsForAssignment(assignment.id)
			]);

			const userIdAssessmentMap = new Map<string, Assessment>();
			assessments.forEach(assessment => {
				assessment.assessmentUserRelations.forEach(relation => {
					userIdAssessmentMap.set(relation.userId, assessment);
				});
			});

			const recipients = this.filterReceivers(participants, "ASSIGNMENT_EVALUATED").filter(
				p => userIdAssessmentMap.has(p.userId)
			);

			const mailPromises = recipients.map(participant => {
				const assessment = userIdAssessmentMap.get(participant.userId);
				const mail = MailFactory.create(
					"ASSIGNMENT_EVALUATED",
					[participant.user.email],
					this.getPreferredLanguage(participant),
					{
						assessmentId: assessment.id,
						assignment,
						courseId: assignment.courseId
					}
				);
				return this.mailingService.send(mail);
			});

			await Promise.all(mailPromises);
		}
	}

	async onAssessmentScoreChanged(event: AssessmentScoreChanged): Promise<void> {
		const assessment = await this.assessmentRepository.getAssessmentById(event.assessmentId);
		const courseId = assessment.assignment.courseId;
		const userIds = assessment.assessmentUserRelations.map(r => r.userId);

		const participants = await this.participantRepository.getParticipantsWithUserSettings(
			courseId,
			{ userIds }
		);

		const recipients = this.splitRecipientsByLanguage(
			this.filterReceivers(participants, "ASSESSMENT_SCORE_CHANGED")
		);

		const mailPromises = this.createMailPromises(recipients, language => {
			return MailFactory.create(
				"ASSESSMENT_SCORE_CHANGED",
				recipients[language].map(p => p.user.email),
				language,
				{
					assessment,
					assignment: assessment.assignment
				}
			);
		});

		await Promise.all(mailPromises);
	}

	async onParticipantJoinedGroup(event: UserJoinedGroupEvent): Promise<void> {
		const group = await this.groupService.getGroup(event.groupId);
		const participants = await this.participantRepository.getParticipantsWithUserSettings(
			event.courseId,
			{ userIds: group.members.map(m => m.userId) }
		);

		const recipients = this.filterReceivers(participants, "PARTICIPANT_JOINED_GROUP").filter(
			p => p.userId !== event.userId // Exclude the student that joined the group
		);

		const newMember = group.members.find(m => m.userId === event.userId);

		const mailPromises = recipients.map(participant => {
			const mail = MailFactory.create(
				"PARTICIPANT_JOINED_GROUP",
				[participant.user.email],
				this.getPreferredLanguage(participant),
				{
					courseId: event.courseId,
					participantName: newMember.displayName,
					participantEmail: newMember.email
				}
			);

			return this.mailingService.send(mail);
		});

		await Promise.all(mailPromises);
	}

	async onParticipantLeftGroup(event: UserLeftGroupEvent): Promise<void> {
		const [group, participantThatLeft] = await Promise.all([
			this.groupService.getGroup(event.groupId),
			this.participantRepository.getParticipant(event.courseId, event.userId)
		]);

		const recipients = await this.participantRepository.getParticipantsWithUserSettings(
			event.courseId,
			{ userIds: group.members.map(m => m.userId) }
		);

		const mailPromises = recipients.map(participant => {
			const mail = MailFactory.create(
				"PARTICIPANT_LEFT_GROUP",
				[participant.user.email],
				this.getPreferredLanguage(participant),
				{
					courseId: event.courseId,
					participantName: participantThatLeft.user.username
				}
			);

			return this.mailingService.send(mail);
		});

		await Promise.all(mailPromises);
	}

	async onSubmissionCreated(event: SubmissionCreated): Promise<void> {
		try {
			const { assignment, userId, groupId } = event;

			let group: GroupDto | null = null;

			if (groupId) {
				group = await this.registrations.getRegisteredGroupWithMembers(
					assignment.id,
					groupId
				);
			}

			const userIds = group ? group.members.map(m => m.userId) : [userId];

			const members = await this.participantRepository.getParticipantsWithUserSettings(
				assignment.courseId,
				{ userIds }
			);

			const recipients = this.filterReceivers(members, "SUBMISSION_CREATED");

			const mailPromises = recipients.map(participant => {
				const mail = MailFactory.create(
					"SUBMISSION_CREATED",
					[participant.user.email],
					this.getPreferredLanguage(participant),
					{
						courseId: assignment.courseId,
						assignmentName: assignment.name,
						groupName: group?.name
					}
				);

				return this.mailingService.send(mail);
			});

			await Promise.all(mailPromises);
		} catch (error) {
			this.logger.error("An error occurred in onSubmissionCreated.");
		}
	}

	createMailPromises(
		recipients: RecipientsByLanguage,
		createMailFn: (language: Language) => Mail
	): Promise<boolean>[] {
		return Object.keys(recipients).map((language: Language) => {
			if (recipients[language].length > 0) {
				const mail = createMailFn(language);
				return this.mailingService.send(mail);
			}
		});
	}

	/**
	 * Returns an array of `Participant` that excludes participants that do not want to receive
	 * emails (for this event).
	 */
	filterReceivers(participants: Participant[], event: MailEvent): Participant[] {
		return participants.filter(p => {
			if (!p.user.email) {
				return false;
			}

			const settings = p.user.settings;
			if (settings) {
				if (!settings.allowEmails || settings.blacklistedEvents?.[event]) {
					return false;
				}
			}

			return true;
		});
	}

	/**
	 * Splits the given `participants` into two arrays depending on their language.
	 * If the language is not specified in the `UserSettings`, it will assume that they are german
	 * recipients.
	 */
	splitRecipientsByLanguage(participants: Participant[]): RecipientsByLanguage {
		const split: RecipientsByLanguage = {
			DE: [],
			EN: []
		};

		for (const participant of participants) {
			if (participant.user.settings?.language === Language.EN) {
				split.EN.push(participant);
			} else {
				// Use german as default
				split.DE.push(participant);
			}
		}

		return split;
	}

	getPreferredLanguage(participant: Participant): Language {
		return participant.user.settings?.language ?? Language.DE;
	}
}
