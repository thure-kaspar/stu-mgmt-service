import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { DtoFactory } from "../../../shared/dto-factory";
import { CourseUserRelation } from "../../entities/course-user-relation.entity";
import { CourseId } from "../../entities/course.entity";
import { CourseUserRelationRepository } from "../../repositories/course-user-relation.repository";
import { ParticipantsComparisonDto } from "./participants-comparison.dto";

export class CompareParticipantsListQuery {
	constructor(
		public courseId: CourseId,
		public compareToCourseIds: CourseId[]
	) { }
}

@QueryHandler(CompareParticipantsListQuery)
export class CompareParticipantsListHandler implements IQueryHandler<CompareParticipantsListQuery> {

	constructor(@InjectRepository(CourseUserRelation) private repo: CourseUserRelationRepository) { }

	async execute(query: CompareParticipantsListQuery): Promise<ParticipantsComparisonDto> {
		const { courseId, compareToCourseIds } = query;

		// Get all participants that were in at least one of the compared courses
		const inComparedCourses = await this.repo.createQueryBuilder("courseUserRelation")
			.where("courseUserRelation.courseId = :courseId", { courseId })
			.leftJoinAndSelect("courseUserRelation.user", "user")
			.innerJoin("user.courseUserRelations", "userCourseUserRelations", 
				"userCourseUserRelations.courseId IN (:...compareToCourseIds)", { compareToCourseIds })
			.getMany();

		// Find all participants that were NOT in the result of the first query
		const inIds = inComparedCourses.map(rel => rel.id);
		const notIn = await this.repo.createQueryBuilder("courseUserRelation")
			.where("courseUserRelation.courseId = :courseId", { courseId })
			.andWhere("courseUserRelation.id NOT IN (:...inIds)", { inIds })
			.innerJoinAndSelect("courseUserRelation.user", "user")
			.getMany();
			
		return {
			inComparedCourses: inComparedCourses.map(rel => DtoFactory.createUserDto(rel.user)),
			notInComparedCourses: notIn.map(rel => DtoFactory.createUserDto(rel.user)),
		};
	}

}
