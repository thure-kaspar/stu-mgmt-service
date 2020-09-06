import { Controller, Get, Header, Param, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AdmissionStatusService } from "../../admission-status/admission-status.service";
import { toString } from "../../admission-status/dto/admission-rule.dto";
import { AssignmentId } from "../../course/entities/assignment.entity";
import { CourseId } from "../../course/entities/course.entity";
import { CourseMemberGuard } from "../../course/guards/course-member.guard";
import { TeachingStaffGuard } from "../../course/guards/teaching-staff.guard";
import { AssessmentService } from "../../course/services/assessment.service";
import { AssignmentRegistrationService } from "../../course/services/assignment-registration.service";
import { CourseConfigService } from "../../course/services/course-config.service";
import { CourseParticipantsService } from "../../course/services/course-participants.service";
import { GroupService } from "../../course/services/group.service";
import { CsvConverterService } from "../services/csv-converter.service";

@ApiBearerAuth()
@ApiTags("csv")
@Controller("csv")
@UseGuards(AuthGuard())
export class CsvController {

	private readonly separator = "\t";

	constructor(private csvConverter: CsvConverterService,
				private participants: CourseParticipantsService,
				private courseConfig: CourseConfigService,
				private groupService: GroupService,
				private assessmentService: AssessmentService,
				private registrations: AssignmentRegistrationService,
				private admissionStatus: AdmissionStatusService) { }

	@ApiOperation({
		operationId: "getParticipantsAsCsv",
		summary: "Get participants.",
		description: "Returns a .csv file containing the participants of the specified course. Requires LECTURER or TUTOR role."
	})
	@Header("content-type", "text/csv")
	@Get("courses/:courseId/users")
	@UseGuards(CourseMemberGuard, TeachingStaffGuard)
	async getParticipantsAsCsv(
		@Res() response: Response,
		@Param("courseId") courseId: CourseId,
	): Promise<void> {

		const [participants] = await this.participants.getParticipants(courseId);

		const row = (userId, role, email, username, displayName, group) => {
			return `${userId}${this.separator}${role}${this.separator}${email}${this.separator}${username}${this.separator}${displayName}${this.separator}${group}\n`;
		};

		const header = row("userId", "role", "email", "username", "displayName", "group");
		let data = "";
		participants.forEach(p => {
			data += row(p.userId, p.role, p.email, p.username, p.displayName, p.group?.name ?? "");
		});

		const tsv = header + data;
		
		try {
			response.attachment(`${courseId}-participants.tsv`);
			response.status(200).send(tsv);
		} catch(error) {
			response.status(500).send();
		}
	}

	@ApiOperation({
		operationId: "getRegisteredGroupsAsCsv",
		summary: "Get registered groups.",
		description: "Retrieves a .csv containing all registered groups and their members for the specified assignment. Requires LECTURER or TUTOR role."
	})
	@Header("content-type", "text/csv")
	@Get("courses/:courseId/assignments/:assignmentId/registrations")
	@UseGuards(CourseMemberGuard, TeachingStaffGuard)
	async getRegisteredGroups(
		@Res() response: Response,
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: AssignmentId
	): Promise<void> {

		const data = await this.csvConverter.flattenData(
			this.registrations.getRegisteredGroupsWithMembers(assignmentId), 
			this.separator
		);

		try {
			response.attachment(`${courseId}-${assignmentId}-registered-groups.tsv`);
			response.status(200).send(data);
		} catch(error) {
			response.status(500).send();
		}
	}

	@ApiOperation({
		operationId: "getAssessmentsForAssignmentAsCsv",
		summary: "Get assessments of assignments.",
		description: "Retrieves a .csv containing all assessments of a specified assignment. Requires LECTURER or TUTOR role."
	})
	@Header("content-type", "text/csv")
	@Get("courses/:courseId/assignments/:assignmentId/assessments")
	@UseGuards(CourseMemberGuard, TeachingStaffGuard)
	async getAssessmentsForAssignment(
		@Res() response: Response,
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: AssignmentId
	): Promise<void> {

		const data = await this.csvConverter.flattenData(
			this.assessmentService.getAssessmentsForAssignment(assignmentId), 
			this.separator
		);

		try {
			response.attachment(`${courseId}-${assignmentId}-assessments.tsv`);
			response.status(200).send(data);
		} catch(error) {
			response.status(500).send();
		}
	}

	@ApiOperation({
		operationId: "getPointsOverviewAsCsv",
		summary: "Get points overview.",
		description: "Returns a .csv file containing the achieved points of every student for all assignments of the specified course. Requires LECTURER or TUTOR role."
	})
	@Header("content-type", "text/csv")
	@Get("courses/:courseId/admission-status/overview")
	@UseGuards(CourseMemberGuard, TeachingStaffGuard)
	async getPointsOverviewAsCsv(
		@Res() response: Response,
		@Param("courseId") courseId: CourseId
	): Promise<void> {
		const overview = await this.admissionStatus.getPointsOverview(courseId);

		let firstRow = `userId${this.separator}displayName${this.separator}username`;
		overview.assignments.forEach(assignment => firstRow += this.separator + assignment.name);

		let secondRow = `max points${this.separator}max points${this.separator}max points`;
		overview.assignments.forEach(assignment => secondRow += this.separator + assignment.points);

		let data = "";
		overview.results.forEach(result => {
			data += `${result.student.userId}${this.separator}${result.student.displayName}${this.separator}${result.student.username}`;
			result.achievedPoints.forEach(points => data += this.separator + points);
			data += "\n";
		});

		const csv = firstRow + "\n" + secondRow + "\n" + data;

		try {
			response.attachment(`${courseId}-points-overview.tsv`);
			response.status(200).send(csv);
		} catch(error) {
			response.status(500).send();
		}
	}
	
	@ApiOperation({
		operationId: "getAdmissionStatusOfParticipantsAsCsv",
		summary: "Get admission status of participants.",
		description: "Returns a .csv file containing the admission criteria and information about their fulfillment for each participant. Requires LECTURER or TUTOR role."
	})
	@Header("content-type", "text/csv")
	@Get("courses/:courseId/admission-status")
	@UseGuards(CourseMemberGuard, TeachingStaffGuard)
	async getAdmissionStatusOfParticipantsAsCsv(
		@Res() response: Response,
		@Param("courseId") courseId: CourseId
	): Promise<void> {
		const [criteria, admissionStatus] = await Promise.all([
			this.courseConfig.getAdmissionCriteria(courseId),
			this.admissionStatus.getAdmissionStatusOfParticipants(courseId)
		]);

		let firstRow = `userId${this.separator}displayName${this.separator}username${this.separator}hasAdmission`;
		criteria.rules.forEach(rule => firstRow += this.separator + `[${toString(rule)}]${this.separator}${this.separator}`);

		let secondRow = `${this.separator}${this.separator}${this.separator}`;
		criteria.rules.forEach(rule => secondRow += `${this.separator}passed${this.separator}achievedPoints${this.separator}achievedPercent`);
		
		let data = "";
		admissionStatus.forEach(status => {
			data += `${status.participant.userId}${this.separator}${status.participant.displayName}${this.separator}${status.participant.username}${this.separator}${status.hasAdmission}`;
			status.results.forEach(result => data += this.separator + result.passed + this.separator + result.achievedPoints + this.separator + result.achievedPercent);
			data += "\n";
		});

		const csv = firstRow + "\n" + secondRow + "\n" + data;

		try {
			response.attachment(`${courseId}-admission-status.tsv`);
			response.status(200).send(csv);
		} catch(error) {
			response.status(500).send();
		}
	}

}
