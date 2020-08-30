import { Controller, Get, Header, Param, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AdmissionStatusService } from "../../admission-status/admission-status.service";
import { toString } from "../../admission-status/dto/admission-rule.dto";
import { CourseId } from "../../course/entities/course.entity";
import { CourseMemberGuard } from "../../course/guards/course-member.guard";
import { TeachingStaffGuard } from "../../course/guards/teaching-staff.guard";
import { CourseConfigService } from "../../course/services/course-config.service";
import { CourseParticipantsService } from "../../course/services/course-participants.service";
import { CsvConverterService } from "../services/csv-converter.service";

@ApiBearerAuth()
@ApiTags("csv")
@Controller("csv")
@UseGuards(AuthGuard())
export class CsvController {

	constructor(private csvConverter: CsvConverterService,
				private participants: CourseParticipantsService,
				private courseConfig: CourseConfigService,
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
		
		try {
			const csv = await this.csvConverter.parse(participants, ["userId", "email", "rzName", "username"]);
			response.attachment(`${courseId}-participants.csv`);
			response.status(200).send(csv);
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

		let firstRow = "userId,rzName,username";
		overview.assignments.forEach(assignment => firstRow += "," + assignment.name);

		let secondRow = "max points, max points, max points";
		overview.assignments.forEach(assignment => secondRow += "," + assignment.points);

		let data = "";
		overview.results.forEach(result => {
			data += `${result.student.userId},${result.student.rzName},${result.student.username}`;
			result.achievedPoints.forEach(points => data += "," + points);
			data += "\n";
		});

		const csv = firstRow + "\n" + secondRow + "\n" + data;

		try {
			response.attachment(`${courseId}-points-overview.csv`);
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

		let firstRow = "userId,rzName,username,hasAdmission";
		criteria.rules.forEach(rule => firstRow += "," + `[${toString(rule)}],,`);

		let secondRow = ",,,";
		criteria.rules.forEach(rule => secondRow += ",passed,achievedPoints,achievedPercent");
		
		let data = "";
		admissionStatus.forEach(status => {
			data += `${status.participant.userId},${status.participant.rzName},${status.participant.username},${status.hasAdmission}`;
			status.results.forEach(result => data += "," + result.passed + "," + result.achievedPoints + "," + result.achievedPercent);
			data += "\n";
		});

		const csv = firstRow + "\n" + secondRow + "\n" + data;

		try {
			response.attachment(`${courseId}-admission-status.csv`);
			response.status(200).send(csv);
		} catch(error) {
			response.status(500).send();
		}
	}

}
