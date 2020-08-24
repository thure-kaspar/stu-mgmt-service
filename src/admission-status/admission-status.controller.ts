import { Controller, Get, NotImplementedException, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CourseId } from "../course/entities/course.entity";
import { CourseMemberGuard } from "../course/guards/course-member.guard";
import { IdentityGuard } from "../course/guards/identity.guard";
import { TeachingStaffGuard } from "../course/guards/teaching-staff.guard";
import { UserId } from "../shared/entities/user.entity";
import { AdmissionStatusService } from "./admission-status.service";
import { PointsOverviewDto } from "./dto/points-overview.dto";

@ApiBearerAuth()
@ApiTags("admission-status")
@UseGuards(AuthGuard(), CourseMemberGuard)
@Controller("courses/:courseId/admission-status")
export class AdmissionStatusController {

	constructor(private admissionStatus: AdmissionStatusService) { }

	@Get()
	getAdmissionStatusOfParticipants(
		@Param("courseId") courseId: CourseId
	): Promise<any[]> {

		throw new NotImplementedException();
	}

	@ApiOperation({
		operationId: "getPointsOverview",
		summary: "Get points overview.",
		description: "Returns an overview of the achieved points of all students mapped the assignments."
	})
	@Get("overview")
	@UseGuards(TeachingStaffGuard)
	getPointsOverview(@Param("courseId") courseId: CourseId): Promise<PointsOverviewDto> {
		return this.admissionStatus.getPointsOverview(courseId);
	}

	@ApiOperation({
		operationId: "getPointsOverviewOfStudent",
		summary: "Get points overview of student.",
		description: "Returns an overview of the achieved points of a student mapped the assignments."
	})
	@Get("overview/:userId")
	@UseGuards(IdentityGuard)
	getPointsOverviewOfStudent(
		@Param("courseId") courseId: CourseId,
		@Param("userId") userId: UserId
	): Promise<PointsOverviewDto> {

		return this.admissionStatus.getPointsOverviewOfStudent(courseId, userId);
	}

}
