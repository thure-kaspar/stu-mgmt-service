import { Controller, Get, Param, Res, UseGuards, Header } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AdmissionStatusService } from "../../admission-status/admission-status.service";
import { CourseId } from "../../course/entities/course.entity";
import { CourseMemberGuard } from "../../course/guards/course-member.guard";
import { TeachingStaffGuard } from "../../course/guards/teaching-staff.guard";
import { CourseParticipantsService } from "../../course/services/course-participants.service";
import { CsvConverterService } from "../services/csv-converter.service";

@ApiBearerAuth()
@ApiTags("csv")
@Controller("csv")
@UseGuards(AuthGuard())
export class CsvController {

	constructor(private csvConverter: CsvConverterService,
				private participants: CourseParticipantsService,
				private admissionStatus: AdmissionStatusService) { }

	@ApiOperation({
		operationId: "getParticipants",
		summary: "Get participants.",
		description: "Returns a .csv file containing the participants of the specified course. Requires LECTURER or TUTOR role."
	})
	@Header("content-type", "text/csv")
	@Get("courses/:courseId/users")
	@UseGuards(CourseMemberGuard, TeachingStaffGuard)
	async getParticipants(
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
		operationId: "getPointsOverview",
		summary: "Get points overview.",
		description: "Returns a .csv file containing the achieved points of every student for all assignments of the specified course. Requires LECTURER or TUTOR role."
	})
	@Header("content-type", "text/csv")
	@Get("courses/:courseId/admission-status/overview")
	@UseGuards(CourseMemberGuard, TeachingStaffGuard)
	async getPointsOverview(
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
			console.log(csv);
			response.attachment(`${courseId}-points-overview.csv`);
			response.status(200).send(csv);
		} catch(error) {
			response.status(500).send();
		}
	}
	
}
