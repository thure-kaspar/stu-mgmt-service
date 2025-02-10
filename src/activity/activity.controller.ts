import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CourseMemberGuard } from "../course/guards/course-member/course-member.guard";
import { TeachingStaffGuard } from "../course/guards/teaching-staff.guard";
import { ActivityDto } from "./activity.dto";
import { ActivityService } from "./activity.service";
import { Public } from "nest-keycloak-connect";
import { environment } from "src/.config/environment";

@ApiTags("activity")
@ApiBearerAuth()
@Controller("courses/:courseId/activity")
@Public(environment.is("development", "demo", "testing"))
@UseGuards(AuthGuard, CourseMemberGuard, TeachingStaffGuard)
export class ActivityController {
	constructor(private activityService: ActivityService) {}

	@ApiOperation({
		operationId: "getActivityData",
		summary: "Get activity data from this course.",
		description: "Returns timestamps for each student of this course that ..."
	})
	@Get()
	async getActivityData(@Param("courseId") courseId: string): Promise<ActivityDto[]> {
		return this.activityService.getActivityData(courseId);
	}
}
