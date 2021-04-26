import { BadRequestException, Controller, Get, Header, Param, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import * as excel from "exceljs";
import { Response } from "express";
import * as flat from "flat";
import { AdmissionStatusService } from "../admission-status/admission-status.service";
import { AssessmentService } from "../assessment/services/assessment.service";
import { AssignmentRegistrationService } from "../course/services/assignment-registration.service";
import { CourseConfigService } from "../course/services/course-config.service";
import { CourseParticipantsService } from "../course/services/course-participants.service";

function flattenObjects<T>(data: T[]): any[] {
	return data.map(entry => flat.flatten(entry));
}

async function sendWorkbook<T>(res: Response, data: T[]): Promise<void> {
	const flatData = flattenObjects(data);

	const workbook = new excel.Workbook();
	const ws = workbook.addWorksheet();

	createHeaderRow(flatData, ws);
	ws.addRows(flatData);

	await workbook.xlsx.write(res);
	res.status(200).end();
}

function createHeaderRow(flatData: any[], ws: excel.Worksheet) {
	let objectWithMostKeys = flatData[0];
	let maxKeyCount = Object.keys(objectWithMostKeys).length;

	for (const data of flatData) {
		const keyCount = Object.keys(data).length;
		if (keyCount > maxKeyCount) {
			objectWithMostKeys = data;
			maxKeyCount = keyCount;
		}
	}

	ws.columns = Object.keys(objectWithMostKeys).map(key => ({
		header: key,
		key: key
	}));
}

@ApiTags("export")
@Controller("export")
export class ExportController {
	constructor(
		private courseParticipants: CourseParticipantsService,
		private admissionStatus: AdmissionStatusService,
		private participants: CourseParticipantsService,
		private courseConfig: CourseConfigService,
		private assessmentService: AssessmentService,
		private registrations: AssignmentRegistrationService
	) {}

	@Get(":courseId/:domain")
	@Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	async export(
		@Param("courseId") courseId: string,
		@Param("domain") domain: string,
		@Query("assignmentId") assignmentId: string,
		@Res() res: Response
	): Promise<void> {
		const domainMap: { [key: string]: (...params: any) => Promise<unknown[]> } = {
			"admission-status": (courseId: string) =>
				this.admissionStatus.getAdmissionStatusOfParticipants(courseId),
			participants: (courseId: string) => this.participants.getParticipants(courseId),
			"registered-groups": async (courseId: string, assignmentId: string) => {
				const [groups] = await this.registrations.getRegisteredGroupsWithMembers(
					assignmentId
				);
				return groups;
			},
			points: async (courseId: string) => {
				const pointsOverview = await this.admissionStatus.getPointsOverview(courseId);

				//pointsOverview.results[0].

				return null;
			}
		};

		if (!Object.keys(domainMap).includes(domain)) {
			throw new BadRequestException("Unknown domain: " + domain);
		}

		const data = await this.admissionStatus.getAdmissionStatusOfParticipants(courseId);
		return sendWorkbook(res, data);
	}
}
