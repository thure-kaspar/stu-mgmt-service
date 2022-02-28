import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CourseMemberGuard } from "../course/guards/course-member/course-member.guard";
import { TeachingStaffGuard } from "../course/guards/teaching-staff.guard";
import { CourseParticipantsService } from "../course/services/course-participants.service";
import { CourseRole } from "../shared/enums";
import { ActivityDto } from "./activity.dto";
import { Activity } from "./activity.entity";

@ApiTags("activity")
@ApiBearerAuth()
@Controller("courses/:courseId/activity")
@UseGuards(AuthGuard, CourseMemberGuard, TeachingStaffGuard)
export class ActivityController {
	constructor(
		@InjectRepository(Activity) private readonly repo: Repository<Activity>,
		private participants: CourseParticipantsService
	) {}

	@ApiOperation({
		operationId: "getActivityData",
		summary: "Get activity data from this course.",
		description: "Returns timestamps for each student of this course that ..."
	})
	@Get()
	async getActivityData(@Param("courseId") courseId: string): Promise<ActivityDto[]> {
		const [activityData, [students]] = await Promise.all([
			this.repo.find({ where: { courseId } }),
			this.participants.getParticipants(courseId, { courseRole: [CourseRole.STUDENT] })
		]);

		const activityByUserId = new Map<string, ActivityDto>();
		for (const student of students) {
			activityByUserId.set(student.userId, {
				user: student,
				dates: []
			});
		}

		for (const activity of activityData) {
			activityByUserId.get(activity.userId)?.dates.push(activity.date);
		}

		const result: ActivityDto[] = [];
		activityByUserId.forEach(activity => result.push(activity));

		return result;
	}
}
