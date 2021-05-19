import { Injectable } from "@nestjs/common";
import { ofType, Saga } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Assessment } from "../../assessment/entities/assessment.entity";
import { AssessmentScoreChanged } from "../../assessment/events/assessment-score-changed.event";
import { AssessmentRepository } from "../../assessment/repositories/assessment.repository";
import { Participant } from "../../course/entities/participant.entity";
import { Event } from "../../course/events";
import { AssignmentStateChanged } from "../../course/events/assignment/assignment-state-changed.event";
import { Assignment } from "../../course/models/assignment.model";
import { ParticipantRepository } from "../../course/repositories/participant.repository";
import { AssignmentState, AssignmentType } from "../../shared/enums";
import { Language } from "../../shared/language";
import { MailFactory } from "../mail-templates";
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
				// Methods will check themselves, whether mails should be sends (easier to test)
				this.onAssignmentStarted(event);
				this.onAssignmentEvaluated(event);
			}),
			map(() => undefined)
		);
	};

	@Saga()
	assignmentEvaluated$ = (events$: Observable<unknown>): Observable<unknown> => {
		return events$.pipe(
			ofType(AssignmentStateChanged),
			tap(async event => {
				this.onAssignmentStarted(event);
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

	constructor(
		private mailingService: MailingService,
		@InjectRepository(ParticipantRepository)
		private participantRepository: ParticipantRepository,
		@InjectRepository(AssessmentRepository)
		private assessmentRepository: AssessmentRepository
	) {}

	async onAssignmentStarted({ assignment }: AssignmentStateChanged): Promise<void> {
		if (
			assignment.state === AssignmentState.IN_PROGRESS &&
			assignment.type === AssignmentType.HOMEWORK
		) {
			const participants = await this.participantRepository.getParticipantsWithUserSettings(
				assignment.courseId
			);

			const interestedParticipants = this.filterReceivers(
				participants,
				Event.ASSIGNMENT_STATE_CHANGED
			);

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
				const language = participant.user.settings?.language ?? Language.DE;
				const mail = MailFactory.create(
					"ASSIGNMENT_EVALUATED",
					[participant.user.email],
					language,
					{
						assessment,
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
				getEmails(participants),
				language,
				{
					assessment,
					assignment: assessment.assignment
				}
			);
		});

		await Promise.all(mailPromises);
	}

	createMailPromises(
		recipients: RecipientsByLanguage,
		createMailFn: (language: Language) => Mail
	): Promise<void>[] {
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
	filterReceivers(participants: Participant[], event: string): Participant[] {
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
}
