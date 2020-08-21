import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
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
				private participants: CourseParticipantsService) { }

	@ApiOperation({
		operationId: "getParticipants",
		summary: "Get participants.",
		description: "Returns a .csv file containing the participants of the specified course. Requires LECTURER or TUTOR role."
	})
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
	
}
