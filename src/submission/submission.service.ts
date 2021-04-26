import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AssignmentId } from "../course/entities/assignment.entity";
import { CourseId } from "../course/entities/course.entity";
import { UserId } from "../shared/entities/user.entity";
import { SubmissionCreateDto, SubmissionDto } from "./submission.dto";
import { Submission } from "./submission.entity";
import { SubmissionFilter } from "./submission.filter";

@Injectable()
export class SubmissionService {
	constructor(
		@InjectRepository(Submission) private submissionRepository: Repository<Submission>
	) {}

	async add(
		courseId: string,
		assignmentId: string,
		submission: SubmissionCreateDto
	): Promise<SubmissionDto> {
		const submissionEntity = this.submissionRepository.create({
			courseId,
			assignmentId,
			userId: submission.userId,
			groupId: submission.groupId,
			links: submission.links,
			payload: submission.payload
		});

		await this.submissionRepository.save(submissionEntity);
		return this.getSubmissionById(submissionEntity.id);
	}

	private async getSubmissionById(id: number): Promise<SubmissionDto> {
		const submission = await this.submissionRepository.findOne(id, { relations: ["user"] });
		return submission.toDto();
	}

	async getAllSubmissions(
		courseId: string,
		filter?: SubmissionFilter
	): Promise<[SubmissionDto[], number]> {
		const { displayName, groupName, userId, assignmentId, groupId, skip, take } = filter || {};

		const query = this.submissionRepository
			.createQueryBuilder("submission")
			.where("submission.courseId = :courseId", { courseId })
			.innerJoinAndSelect("submission.user", "user")
			.leftJoinAndSelect("submission.group", "group")
			.skip(skip)
			.take(take)
			.orderBy("submission.date", "DESC");

		if (displayName) {
			query.andWhere("user.displayName ILIKE :name", {
				name: `%${displayName}%`
			});
		}

		if (groupName) {
			query.andWhere("group.name ILIKE :name", {
				name: `%${groupName}%`
			});
		}

		if (userId) {
			query.andWhere("submission.userId = :userId", { userId });
		}

		if (assignmentId) {
			query.andWhere("submission.assignmentId = :assignmentId", { assignmentId });
		}

		if (groupId) {
			query.andWhere("submission.groupId = :groupId", { groupId });
		}

		const [submissions, count] = await query.getManyAndCount();
		return [submissions.map(s => s.toDto()), count];
	}

	async getAllSubmissionsOfUser(
		courseId: CourseId,
		userId: UserId
	): Promise<[SubmissionDto[], number]> {
		return this.getAllSubmissions(courseId, new SubmissionFilter({ userId }));
	}

	async getAllSubmissionsOfAssignmentOfGroup(
		courseId: string,
		groupId: string,
		assignmentId: string
	): Promise<[SubmissionDto[], number]> {
		return this.getAllSubmissions(courseId, new SubmissionFilter({ groupId, assignmentId }));
	}

	async getLatestSubmissionOfAssignment(
		userId: UserId,
		assignmentId: AssignmentId
	): Promise<SubmissionDto> {
		const submission = await this.submissionRepository.findOne({
			where: { userId, assignmentId },
			order: {
				date: "DESC"
			},
			relations: ["user"]
		});

		return submission.toDto();
	}

	async removeAllSubmissionsOfAssignment(assignmentId: AssignmentId): Promise<void> {
		await this.submissionRepository.delete({ assignmentId });
	}
}
