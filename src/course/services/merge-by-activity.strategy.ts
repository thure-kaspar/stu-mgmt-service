import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Activity } from "../../activity/activity.entity";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { GroupDto } from "../dto/group/group.dto";
import { ParticipantRepository } from "../repositories/participant.repository";

@Injectable()
export class MergeByActivityStrategy {
	constructor(
		@InjectRepository(ParticipantRepository)
		private participantsRepository: ParticipantRepository,
		@InjectRepository(Activity) private activityRepository: Repository<Activity>
	) {}

	async merge(
		courseId: string,
		minSize: number,
		maxSize: number,
		groups: { name: string; members: ParticipantDto[] }[]
	): Promise<GroupDto[]> {
		const nonEmptyGroups = groups.filter(g => g.members.length > 0);

		// Groups that have multiple members, but are below minSize
		const mustBeFilled = nonEmptyGroups
			.filter(g => g.members.length < minSize && g.members.length > 1)
			.sort((a, b) => a.members.length - b.members.length);

		// Groups with only one member
		const singles = nonEmptyGroups.filter(g => g.members.length == 1);

		// Fill up groups first

		return [];
	}
}

/**
 * - Assign average activity score to each group
 * - Try to fill up open groups with capacity (filter closed with size >= minSize)
 * - If group is too small, add student with nearest activity score
 * - If remaining students can't create valid group, backtrack from filling up and
 *
 *
 * - Only look at groups that are too small
 * - Rank them by average activity score
 * - Split by maxSize
 * - If last group is too small and minSize < maxSize, switch student down until minSize reached
 *
 * - [8, 12345, 123]
 * - [8, 1234, 1234]
 *
 * -
 */
