import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CourseMemberGuard } from "../course/guards/course-member/course-member.guard";
import { TeachingStaffGuard } from "../course/guards/teaching-staff.guard";
import { ActivityDto } from "./activity.dto";
import { ActivityService } from "./activity.service";

@ApiTags("activity")
@ApiBearerAuth()
@Controller("courses/:courseId/activity")
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
