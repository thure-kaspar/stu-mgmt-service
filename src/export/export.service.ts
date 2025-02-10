import { BadRequestException, Injectable } from "@nestjs/common";
import { AdmissionStatusService } from "../admission-status/admission-status.service";
import { AssessmentService } from "../assessment/services/assessment.service";
import { AssignmentRegistrationService } from "../course/services/assignment-registration.service";
import { CourseParticipantsService } from "../course/services/course-participants.service";
import { createWorkbook, Workbook } from "./excel";

/** Maps an object with nested properties to an object that contains dot-separated properties. */
function flatten<T>(data: T[]): unknown[] {
	let result: unknown[]
	import("flat").then(flat => {
		result = data.map(entry => flat.flatten(entry))
	})
	return result
}

@Injectable()
export class ExportService {
	constructor(
		private admissionStatusService: AdmissionStatusService,
		private assessmentService: AssessmentService,
		private participantsService: CourseParticipantsService,
		private registrationService: AssignmentRegistrationService
	) {}

	async getParticipants(courseId: string): Promise<Workbook> {
		const [participants] = await this.participantsService.getParticipants(courseId);
		return createWorkbook(flatten(participants));
	}

	async getAssessments(courseId: string, assignmentId: string): Promise<Workbook> {
		const [assessments] = await this.assessmentService.getAssessmentsForAssignment(
			assignmentId
		);

		const rows = assessments.map(a => {
			const row = {
				assessmentId: a.id,
				achievedPoints: a.achievedPoints
			};

			if (a.group) {
				row["group"] = a.group.name;
			}

			if (a.group?.members.length > 0) {
				a.group.members.forEach((member, index) => {
					const key = "member-" + (index + 1) + "-";
					row[key + "name"] = member.displayName;
					row[key + "username"] = member.username;
					row[key + "matrNr"] = member.matrNr;
				});
			}

			if (a.participant) {
				row["name"] = a.participant.displayName;
				row["username"] = a.participant.username;
				row["matrNr"] = a.participant.matrNr;
			}

			row["json"] = JSON.stringify(a);
			return row;
		});

		return createWorkbook(rows);
	}

	async getAdmissionStatus(courseId: string): Promise<Workbook> {
		const admissionStatus = await this.admissionStatusService.getAdmissionStatusOfParticipants(
			courseId
		);

		return createWorkbook(flatten(admissionStatus));
	}

	async getPointsOverview(courseId: string): Promise<Workbook> {
		const points = await this.admissionStatusService.getPointsOverview(courseId);
		const rows = [];

		points.results.forEach(result => {
			const student = {
				userId: result.student.userId,
				username: result.student.username,
				displayName: result.student.displayName,
				email: result.student.email,
				matrNr: result.student.matrNr
			};
			let row = {
				...student
			};

			points.assignments.forEach((assignment, index) => {
				row = {
					...row,
					[assignment.name]: result.achievedPoints[index]
				};
			});

			rows.push(row);
		});

		return createWorkbook(rows);
	}

	async getRegisteredGroups(courseId: string, assignmentId: string): Promise<Workbook> {
		if (!assignmentId) {
			throw new BadRequestException("Required query parameter 'assignmentId' is missing.");
		}

		const [registrations] = await this.registrationService.getRegisteredGroupsWithMembers(
			assignmentId
		);
		return createWorkbook(flatten(registrations));
	}
}
