import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { DtoFactory } from "../../../shared/dto-factory";
import { ParticipantEntity } from "../../entities/participant.entity";
import { CourseId } from "../../entities/course.entity";
import { ParticipantRepository } from "../../repositories/participant.repository";
import { ParticipantsComparisonDto } from "./participants-comparison.dto";

export class CompareParticipantsListQuery {
	constructor(
		public courseId: CourseId,
		public compareToCourseIds: CourseId[]
	) { }
}

@QueryHandler(CompareParticipantsListQuery)
export class CompareParticipantsListHandler implements IQueryHandler<CompareParticipantsListQuery> {

	constructor(@InjectRepository(ParticipantEntity) private repo: ParticipantRepository) { }

	async execute(query: CompareParticipantsListQuery): Promise<ParticipantsComparisonDto> {
		const { courseId, compareToCourseIds } = query;

		// Get all participants that were in at least one of the compared courses
		const inComparedCourses = await this.repo.createQueryBuilder("participant")
			.where("participant.courseId = :courseId", { courseId })
			.leftJoinAndSelect("participant.user", "user")
			.innerJoin("user.participations", "userParticipants", 
				"userParticipants.courseId IN (:...compareToCourseIds)", { compareToCourseIds })
			.getMany();

		// Find all participants that were NOT in the result of the first query
		const inIds = inComparedCourses.map(rel => rel.id);
		const notIn = await this.repo.createQueryBuilder("participant")
			.where("participant.courseId = :courseId", { courseId })
			.andWhere("participant.id NOT IN (:...inIds)", { inIds })
			.innerJoinAndSelect("participant.user", "user")
			.getMany();
			
		return {
			inComparedCourses: inComparedCourses.map(rel => DtoFactory.createUserDto(rel.user)),
			notInComparedCourses: notIn.map(rel => DtoFactory.createUserDto(rel.user)),
		};
	}

}
