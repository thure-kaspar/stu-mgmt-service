import * as jsxt from "template-jsx";
import { Assessment } from "../assessment/entities/assessment.entity";
import { Assignment as AssignmentEntity } from "../course/entities/assignment.entity";
import { Assignment } from "../course/models/assignment.model";
import { Language } from "../shared/language";
import { Mail } from "./mail.model";

type MailContent = {
	subject: string;
	text: string;
	html: string;
};

export type MailEvent =
	| "ASSIGNMENT_STARTED"
	| "ASSIGNMENT_EVALUATED"
	| "ASSESSMENT_SCORE_CHANGED"
	| "PARTICIPANT_JOINED_GROUP"
	| "PARTICIPANT_LEFT_GROUP";

const EventFunction = {
	ASSIGNMENT_STARTED: AssignmentStartedMail,
	ASSIGNMENT_EVALUATED: AssignmentEvaluatedMail,
	ASSESSMENT_SCORE_CHANGED: AssessmentScoreChangedMail,
	PARTICIPANT_JOINED_GROUP: ParticipantJoinedGroupMail,
	PARTICIPANT_LEFT_GROUP: ParticipantLeftGroupMail
} as const;

/**
 * Generic that extracts the type of the first parameter (`props`) of a function that
 * generates `MailContent`.
 */
type Props<Fn> = Fn extends (props: infer Props, ...args: any) => MailContent ? Props : never;

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
			<>
				<h2>
					{props.courseId} – Neue Aufgabe {props.assignmentName}
				</h2>
				<p>Die Aufgabe "{props.assignmentName}" kann jetzt bearbeitet werden.</p>
				<jsxt.If cond={!!props.endDate}>
					<p>Die Bearbeitungszeit endet am {props.endDate?.toLocaleString()}.</p>
				</jsxt.If>
				<br />
				<p>Viel Erfolg!</p>
			</>
		);
	} else {
		mail.subject = `${props.courseId} – New Assignment: ${props.assignmentName}`;
		mail.text = `The assignment "${props.assignmentName}" is now available.`;
		mail.html = jsxt.render(
			<>
				<h2>
					{props.courseId} – New assignment {props.assignmentName}
				</h2>
				<p>The assignment "{props.assignmentName}" is now available.</p>
				<jsxt.If cond={!!props.endDate}>
					<p>Submissions can be turned in until {props.endDate?.toLocaleString()}.</p>
				</jsxt.If>
				<br />
				<p>Good luck!</p>
			</>
		);
	}

	return mail;
}

function AssignmentEvaluatedMail(
	props: {
		courseId: string;
		assignment: Assignment | AssignmentEntity;
		assessment: Assessment;
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
			<>
				<h2>
					{props.assignment.courseId} – Bewertung von {props.assignment.name}
				</h2>
				<p>Die Bewertung für Aufgabe "{props.assignment.name}" wurde veröffentlicht.</p>
				<a
					href={`http://TODO/courses/${props.assignment.courseId}/assignments/${props.assignment.id}/assessments/view/${props.assessment.id}`}
				>
					Link zur Bewertung
				</a>
			</>
		);
	}

	if (language === Language.EN) {
		mail.subject = `${props.assignment.courseId} – Assessment for ${props.assignment.name}`;
		mail.text = `Assessment for "${props.assignment.name}" is now available.`;
		mail.html = jsxt.render(
			<>
				<h2>
					{props.courseId} – Assessment for {props.assignment.name}
				</h2>
				<p>The assessment for "{props.assignment.name}" is now available.</p>
				<a
					href={`http://TODO/courses/${props.assignment.courseId}/assignments/${props.assignment.id}/assessments/view/${props.assessment.id}`}
				>
					Link to the assessment
				</a>
			</>
		);
	}

	return mail;
}

function AssessmentScoreChangedMail(
	props: {
		assignment: Assignment | AssignmentEntity;
		assessment: Assessment;
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
			<>
				<h2>
					{props.assignment.courseId} – Änderung der Bewertung von {props.assignment.name}
				</h2>
				<p>Die Bewertung für Aufgabe "{props.assignment.name}" wurde verändert.</p>
				<a
					href={`http://TODO/courses/${props.assignment.courseId}/assignments/${props.assignment.id}/assessments/view/${props.assessment.id}`}
				>
					Link zur Bewertung
				</a>
			</>
		);
	}

	if (language === Language.EN) {
		mail.subject = `${props.assignment.courseId} – Updated assessment for ${props.assignment.name}`;
		mail.text = `Assessment for "${props.assignment.name}" has been updated.`;
		mail.html = jsxt.render(
			<>
				<h2>
					{props.assignment.courseId} – Updated assessment for {props.assignment.name}
				</h2>
				<p>The assessment for "{props.assignment.name}" has been updated.</p>
				<a
					href={`http://TODO/courses/${props.assignment.courseId}/assignments/${props.assignment.id}/assessments/view/${props.assessment.id}`}
				>
					Link to the assessment
				</a>
			</>
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
			<>
				<h2>{props.courseId} – Neues Gruppenmitglied</h2>
				<p>Ein neues Mitglied hat sich ihrer Gruppe angeschlossen:</p>
				<p>
					{props.participantName} - {props.participantEmail}
				</p>
			</>
		);
	}

	if (language === Language.EN) {
		mail.subject = `${props.courseId} – New group member`;
		mail.text = "A new member has joined your group.";
		mail.html = jsxt.render(
			<>
				<h2>{props.courseId} – New group member</h2>
				<p>A new member has joined your group.</p>
			</>
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
			<>
				<h2>{props.courseId} – Ein Mitglied hat Ihre Gruppe verlassen</h2>
				<p>Ein Mitglied hat Ihre Gruppe verlassen:</p>
				<p>{props.participantName}</p>
			</>
		);
	}

	if (language === Language.EN) {
		mail.subject = `${props.courseId} – A member has left your group`;
		mail.text = "A member has left your group.";
		mail.html = jsxt.render(
			<>
				<h2>{props.courseId} – A member has left your group</h2>
				<p>A member has left your group.</p>
			</>
		);
	}

	return mail;
}
