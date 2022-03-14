import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CourseParticipantsService } from "../course/services/course-participants.service";
import { CourseRole } from "../shared/enums";
import { ActivityDto } from "./activity.dto";
import { Activity } from "./activity.entity";

@Injectable()
export class ActivityService {
	constructor(
		@InjectRepository(Activity) private readonly repo: Repository<Activity>,
		private participants: CourseParticipantsService
	) {}

	async getActivityData(courseId: string): Promise<ActivityDto[]> {
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
