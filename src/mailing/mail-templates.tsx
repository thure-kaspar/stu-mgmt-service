import * as jsxt from "template-jsx";
import { Config } from "../.config/config";
import { Assignment as AssignmentEntity } from "../course/entities/assignment.entity";
import { Assignment } from "../course/models/assignment.model";
import { Language } from "../shared/language";
import { Mail } from "./mail.model";

const clientBasePath = Config.get().mailing.clientBasePath ?? "";

type MailContent = {
	subject: string;
	text: string;
	html: string;
};

const EventFunction = {
	ASSIGNMENT_STARTED: AssignmentStartedMail,
	ASSIGNMENT_EVALUATED: AssignmentEvaluatedMail,
	ASSESSMENT_SCORE_CHANGED: AssessmentScoreChangedMail,
	PARTICIPANT_JOINED_GROUP: ParticipantJoinedGroupMail,
	PARTICIPANT_LEFT_GROUP: ParticipantLeftGroupMail,
	SUBMISSION_CREATED: SubmissionCreated
} as const;

/** Type that contains all Events that can generate an email. */
export type MailEvent = keyof typeof EventFunction;

/**
 * Generic that extracts the type of the first parameter (`props`) of a function that
 * generates `MailContent`.
 */
type Props<Fn> = Fn extends (props: infer Props, ...args: unknown[]) => MailContent ? Props : never;

/**
 * Class that enables the creation of `Mail` objects.
 */
export abstract class MailFactory {
	/**
	 * Creates a `Mail`. The `props` are inferred from the specified `event`.
	 */
	static create<E extends keyof typeof EventFunction>(
		event: E,
		bcc: string[],
		language: Language,
		props: Props<typeof EventFunction[E]>
	): Mail {
		const mail = new Mail(bcc);
		const { subject, text, html } = EventFunction[event](props as any, language);
		mail.subject = subject;
		mail.text = text;
		mail.html = html;
		return mail;
	}
}

function AssignmentStartedMail(
	props: {
		courseId: string;
		assignmentName: string;
		endDate?: Date;
	},
	language: Language
): MailContent {
	const mail = {
		subject: null,
		text: null,
		html: null
	};

	if (language === Language.DE) {
		mail.subject = `${props.courseId} – Neue Aufgabe: ${props.assignmentName}`;
		mail.text = `Aufgabe "${props.assignmentName}" kann jetzt bearbeitet werden.`;
		mail.html = jsxt.render(
			<div>
				<h2>{props.courseId} – Neue Aufgabe</h2>
				<p>Die Aufgabe "{props.assignmentName}" kann jetzt bearbeitet werden.</p>
				<jsxt.If cond={!!props.endDate}>
					<p>Die Bearbeitungszeit endet am {props.endDate?.toLocaleString()}.</p>
				</jsxt.If>
				<br />
				<p>Viel Erfolg!</p>
			</div>
		);
	} else {
		mail.subject = `${props.courseId} – New Assignment: ${props.assignmentName}`;
		mail.text = `The assignment "${props.assignmentName}" is now available.`;
		mail.html = jsxt.render(
			<div>
				<h2>{props.courseId} – New assignment</h2>
				<p>The assignment "{props.assignmentName}" is now available.</p>
				<jsxt.If cond={!!props.endDate}>
					<p>Submissions can be turned in until {props.endDate?.toLocaleString()}.</p>
				</jsxt.If>
				<br />
				<p>Good luck!</p>
			</div>
		);
	}

	return mail;
}

function AssignmentEvaluatedMail(
	props: {
		courseId: string;
		assignment: { name: string; id: string };
		assessmentId: string;
	},
	language: Language
): MailContent {
	const mail = {
		subject: null,
		text: null,
		html: null
	};

	if (language === Language.DE) {
		mail.subject = `${props.courseId} – Bewertung von ${props.assignment.name}`;
		mail.text = `Bewertung für Aufgabe "${props.assignment.name}" wurde veröffentlicht.`;
		mail.html = jsxt.render(
			<div>
				<h2>
					{props.courseId} – Bewertung von {props.assignment.name}
				</h2>
				<p>Die Bewertung für Aufgabe "{props.assignment.name}" wurde veröffentlicht.</p>
				<a
					href={`${clientBasePath}/courses/${props.courseId}/assignments/${props.assignment.id}/assessments/view/${props.assessmentId}`}
				>
					Link zur Bewertung
				</a>
			</div>
		);
	}

	if (language === Language.EN) {
		mail.subject = `${props.courseId} – Assessment for ${props.assignment.name}`;
		mail.text = `Assessment for "${props.assignment.name}" is now available.`;
		mail.html = jsxt.render(
			<jsxt.Default>
				<h2>
					{props.courseId} – Assessment for {props.assignment.name}
				</h2>
				<p>The assessment for "{props.assignment.name}" is now available.</p>
				<a
					href={`${clientBasePath}/courses/${props.courseId}/assignments/${props.assignment.id}/assessments/view/${props.assessmentId}`}
				>
					Link to the assessment
				</a>
			</jsxt.Default>
		);
	}

	return mail;
}

function AssessmentScoreChangedMail(
	props: {
		assignment: { id: string; name: string; courseId: string };
		assessment: { id: string };
	},
	language: Language
): MailContent {
	const mail = {
		subject: null,
		text: null,
		html: null
	};

	if (language === Language.DE) {
		mail.subject = `${props.assignment.courseId} – Änderung der Bewertung von ${props.assignment.name}`;
		mail.text = `Bewertung für Aufgabe "${props.assignment.name}" wurde verändert.`;
		mail.html = jsxt.render(
			<jsxt.Default>
				<h2>
					{props.assignment.courseId} – Änderung der Bewertung von {props.assignment.name}
				</h2>
				<p>Die Bewertung für Aufgabe "{props.assignment.name}" wurde verändert.</p>
				<a
					href={`${clientBasePath}/courses/${props.assignment.courseId}/assignments/${props.assignment.id}/assessments/view/${props.assessment.id}`}
				>
					Link zur Bewertung
				</a>
			</jsxt.Default>
		);
	}

	if (language === Language.EN) {
		mail.subject = `${props.assignment.courseId} – Updated assessment for ${props.assignment.name}`;
		mail.text = `Assessment for "${props.assignment.name}" has been updated.`;
		mail.html = jsxt.render(
			<jsxt.Default>
				<h2>
					{props.assignment.courseId} – Updated assessment for {props.assignment.name}
				</h2>
				<p>The assessment for "{props.assignment.name}" has been updated.</p>
				<a
					href={`${clientBasePath}/courses/${props.assignment.courseId}/assignments/${props.assignment.id}/assessments/view/${props.assessment.id}`}
				>
					Link to the assessment
				</a>
			</jsxt.Default>
		);
	}

	return mail;
}

function ParticipantJoinedGroupMail(
	props: {
		courseId: string;
		participantName: string;
		participantEmail: string;
	},
	language: Language
): MailContent {
	const mail = {
		subject: null,
		text: null,
		html: null
	};

	if (language === Language.DE) {
		mail.subject = `${props.courseId} – Neues Gruppenmitglied`;
		mail.text = "Ein neues Mitglied hat sich ihrer Gruppe angeschlossen.";
		mail.html = jsxt.render(
			<jsxt.Default>
				<h2>{props.courseId} – Neues Gruppenmitglied</h2>
				<p>Ein neues Mitglied hat sich ihrer Gruppe angeschlossen:</p>
				<p>
					{props.participantName} - {props.participantEmail}
				</p>
			</jsxt.Default>
		);
	}

	if (language === Language.EN) {
		mail.subject = `${props.courseId} – New group member`;
		mail.text = "A new member has joined your group.";
		mail.html = jsxt.render(
			<jsxt.Default>
				<h2>{props.courseId} – New group member</h2>
				<p>A new member has joined your group.</p>
			</jsxt.Default>
		);
	}

	return mail;
}

function ParticipantLeftGroupMail(
	props: {
		courseId: string;
		participantName: string;
	},
	language: Language
): MailContent {
	const mail = {
		subject: null,
		text: null,
		html: null
	};

	if (language === Language.DE) {
		mail.subject = `${props.courseId} – Ein Mitglied hat Ihre Gruppe verlassen`;
		mail.text = "Ein Mitglied hat Ihre Gruppe verlassen.";
		mail.html = jsxt.render(
			<jsxt.Default>
				<h2>{props.courseId} – Ein Mitglied hat Ihre Gruppe verlassen</h2>
				<p>Ein Mitglied hat Ihre Gruppe verlassen:</p>
				<p>{props.participantName}</p>
			</jsxt.Default>
		);
	}

	if (language === Language.EN) {
		mail.subject = `${props.courseId} – A member has left your group`;
		mail.text = "A member has left your group.";
		mail.html = jsxt.render(
			<jsxt.Default>
				<h2>{props.courseId} – A member has left your group</h2>
				<p>A member has left your group.</p>
			</jsxt.Default>
		);
	}

	return mail;
}

function SubmissionCreated(
	props: {
		courseId: string;
		assignmentName: string;
		groupName?: string;
	},
	language: Language
): MailContent {
	const mail = {
		subject: null,
		text: null,
		html: null
	};

	if (language === Language.DE) {
		mail.subject = `${props.courseId} – ${props.assignmentName} - Abgabe eingereicht`;
		if (props.groupName) {
			mail.text = `Die Gruppe "${props.groupName}" hat eine Abgabe für "${props.assignmentName}" eingereicht.`;
		} else {
			mail.text = `Sie haben eine Abgabe für "${props.assignmentName}" eingereicht.`;
		}
	}

	if (language === Language.EN) {
		mail.subject = `${props.courseId} – ${props.assignmentName} - Solution submitted`;
		if (props.groupName) {
			mail.text = `Group "${props.groupName}" has submitted a solution for "${props.assignmentName}".`;
		} else {
			mail.text = `You have submitted a solution for "${props.assignmentName}".`;
		}
	}

	return mail;
}
