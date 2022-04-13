import { Assignment } from "../../../src/course/entities/assignment.entity";
import { MailFactory } from "../../../src/mailing/mail-templates";
import { Language } from "../../../src/shared/language";

describe("Mail Templates", () => {
	const bcc = ["ex@mple.email"];

	describe("ASSIGNMENT_STARTED", () => {
		test.each([Language.DE, Language.EN])("%s", language => {
			const mail = MailFactory.create("ASSIGNMENT_STARTED", bcc, language, {
				courseId: "java-wise1920",
				assignmentName: "Homework 01",
				endDate: new Date(2022, 4, 20)
			});

			expect(mail).toMatchSnapshot();
		});
	});

	describe("ASSIGNMENT_EVALUATED", () => {
		test.each([Language.DE, Language.EN])("%s", language => {
			const mail = MailFactory.create("ASSIGNMENT_EVALUATED", bcc, language, {
				courseId: "java-wise1920",
				assignment: {
					name: "Homework 01",
					id: "homework-01",
					courseId: "java-wise1920"
				} as Assignment,
				assessmentId: "assessment-01"
			});

			expect(mail).toMatchSnapshot();
		});
	});

	describe("ASSESSMENT_SCORE_CHANGED", () => {
		test.each([Language.DE, Language.EN])("%s", language => {
			const mail = MailFactory.create("ASSESSMENT_SCORE_CHANGED", bcc, language, {
				assignment: {
					courseId: "java-wise1920",
					id: "homework-01",
					name: "Homework 01"
				},
				assessment: { id: "assessment-01" }
			});

			expect(mail).toMatchSnapshot();
		});
	});

	describe("PARTICIPANT_JOINED_GROUP", () => {
		test.each([Language.DE, Language.EN])("%s", language => {
			const mail = MailFactory.create("PARTICIPANT_JOINED_GROUP", bcc, language, {
				courseId: "java-wise1920",
				participantEmail: "particip@nt.email",
				participantName: "Max Mustermann"
			});

			expect(mail).toMatchSnapshot();
		});
	});

	describe("PARTICIPANT_LEFT_GROUP", () => {
		test.each([Language.DE, Language.EN])("%s", language => {
			const mail = MailFactory.create("PARTICIPANT_LEFT_GROUP", bcc, language, {
				courseId: "java-wise1920",
				participantName: "Max Mustermann"
			});

			expect(mail).toMatchSnapshot();
		});
	});

	describe("SUBMISSION_CREATED", () => {
		describe("With group", () => {
			test.each([Language.DE, Language.EN])("%s", language => {
				const mail = MailFactory.create("SUBMISSION_CREATED", bcc, language, {
					courseId: "java-wise1920",
					assignmentName: "Homework 01",
					groupName: "JAVA-GROUP-01"
				});

				expect(mail).toMatchSnapshot();
			});
		});

		describe("No group", () => {
			test.each([Language.DE, Language.EN])("%s", language => {
				const mail = MailFactory.create("SUBMISSION_CREATED", bcc, language, {
					courseId: "java-wise1920",
					assignmentName: "Homework 01"
				});

				expect(mail).toMatchSnapshot();
			});
		});
	});
});
