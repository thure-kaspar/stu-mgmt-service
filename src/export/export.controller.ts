import {
	BadRequestException,
	Controller,
	Get,
	Header,
	Param,
	Query,
	Res,
	UseGuards
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CourseMemberGuard } from "../course/guards/course-member/course-member.guard";
import { TeachingStaffGuard } from "../course/guards/teaching-staff.guard";
import { writeWorkbookToResponse, Workbook } from "./excel";
import { ExportService } from "./export.service";

@ApiTags("export")
@Controller("export")
@UseGuards(AuthGuard)
export class ExportController {
	constructor(private exportService: ExportService) {}

	@Get(":courseId/:domain")
	@UseGuards(CourseMemberGuard, TeachingStaffGuard)
	@Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	async export(
		@Res() res: Response,
		@Param("courseId") courseId: string,
		@Param("domain") domain: string,
		@Query("assignmentId") assignmentId?: string
	): Promise<void> {
		const workbookLoaderMap: { [key: string]: (...params: any) => Promise<Workbook> } = {
			"admission-status": (courseId: string) => {
				return this.exportService.getAdmissionStatus(courseId);
			},
			assessments: (courseId: string, assignmentId: string) => {
				return this.exportService.getAssessments(courseId, assignmentId);
			},
			participants: (courseId: string) => {
				return this.exportService.getParticipants(courseId);
			},
			registrations: (courseId: string, assignmentId: string) => {
				return this.exportService.getRegisteredGroups(courseId, assignmentId);
			},
			"points-overview": (courseId: string) => {
				return this, this.exportService.getPointsOverview(courseId);
			}
		};

		const workbookLoader = workbookLoaderMap[domain];

		if (!workbookLoader) {
			throw new BadRequestException("Unknown domain: " + domain);
		}

		const workbook = await workbookLoader(courseId, assignmentId);
		await writeWorkbookToResponse(res, workbook);
		res.status(200).end();
	}
}
