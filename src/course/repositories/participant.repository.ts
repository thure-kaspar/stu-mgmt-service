import { ConflictException } from "@nestjs/common";
import { EntityRepository, Repository, Brackets } from "typeorm";
import { Participant } from "../entities/participant.entity";
import { CourseRole } from "../../shared/enums";
import { CourseId } from "../entities/course.entity";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { CourseParticipantsFilter } from "../dto/course-participant/course-participants.filter";
import { UserId } from "../../shared/entities/user.entity";
import { DbException } from "../../shared/database-exceptions";

@EntityRepository(Participant)
export class ParticipantRepository extends Repository<Participant> {
	
	async createParticipant(courseId: CourseId, userId: UserId, role: CourseRole): Promise<Participant> {
		const participant = new Participant();
		participant.courseId = courseId;
		participant.userId = userId;
		participant.role = role;

		await this.save(participant)
			.catch((error) => {
				if (error.code === DbException.PG_UNIQUE_VIOLATION) {
					throw new ConflictException("This user is already signed up to the course.");
				}
			});

		return this.getParticipant(courseId, userId);
	}

	/**
	 * Returns the participants of a course.
	 */
	async getParticipants(courseId: CourseId, filter?: CourseParticipantsFilter): Promise<[Participant[], number]> {
		const { courseRole, name, skip, take } = filter || { };

		const query = this.createQueryBuilder("participant")
			.where("participant.courseId = :courseId", { courseId })
			.innerJoinAndSelect("participant.user", "user")
			.orderBy("participant.role", "ASC")
			.addOrderBy("user.username", "ASC")
			.skip(skip)
			.take(take);

		if (name) {
			query.andWhere(new Brackets(qb => {
				qb.where("user.username ILIKE :name", { name: `%${name}%` });
				qb.orWhere("user.displayName ILIKE :name", { name: `%${name}%` });
			}));
		}
	
		if (courseRole?.length > 0) {
			query.andWhere("participant.role IN (:...courseRole)", { courseRole });
		}

		return query.getManyAndCount();
	}

	async getStudentsWithAssessments(courseId: CourseId): Promise<Participant[]> {
		return this.createQueryBuilder("participant")
			.where("participant.courseId = :courseId", { courseId })
			.andWhere("participant.role = :role", { role: CourseRole.STUDENT })
			.innerJoinAndSelect("participant.user", "user")
			.leftJoinAndSelect("user.assessmentUserRelations", "aur")
			.innerJoinAndSelect("aur.assessment", "assessment")
			.innerJoinAndSelect("assessment.assignment", "assignment", "assignment.courseId = :courseId", { courseId })
			.getMany();
	}

	async getStudentWithAssessments(courseId: CourseId, userId: UserId): Promise<Participant> {
		const query = await this.createQueryBuilder("participant")
			.where("participant.userId = :userId", { userId })
			.andWhere("participant.courseId = :courseId", { courseId })
			.andWhere("participant.role = :role", { role: CourseRole.STUDENT })
			.innerJoinAndSelect("participant.user", "user")
			.leftJoinAndSelect("user.assessmentUserRelations", "aur")
			.innerJoinAndSelect("aur.assessment", "assessment")
			.innerJoinAndSelect("assessment.assignment", "assignment", "assignment.courseId = :courseId", { courseId })
			.getOne();

		if (!query) {
			throw new EntityNotFoundError(Participant, { courseId, userId });
		}
		
		return query;
	}

	/**
	 * Returns a specific participant of a course.
	 * Throws `EntityNotFoundError` if participant does not exist.
	 * 
	 * Includes relations:
	 * - Group (if exists, includes members)
	 */
	async getParticipant(courseId: CourseId, userId: UserId): Promise<Participant> {
		const query = await this.createQueryBuilder("participant")
			.where("participant.userId = :userId", { userId })
			.andWhere("participant.courseId = :courseId", { courseId })
			.innerJoinAndSelect("participant.user", "user")
			.leftJoinAndSelect("participant.groupRelation", "groupRelation")
			.leftJoinAndSelect("groupRelation.group", "group")
			.leftJoinAndSelect("group.userGroupRelations", "userGroupRelation")
			.leftJoinAndSelect("userGroupRelation.participant", "member")
			.leftJoinAndSelect("member.user", "member_user")
			.getOne();

		if (!query) {
			throw new EntityNotFoundError(Participant, { courseId, userId });
		}
		return query;
	}

	async updateRole(courseId: CourseId, userId: UserId, role: CourseRole): Promise<boolean> {
		const relation = await this.findOneOrFail({ where: { courseId, userId } });
		relation.role = role;
		const updated = await this.save(relation);
		return updated ? true : false;
	}

	async removeUser(courseId: CourseId, userId: UserId): Promise<boolean> {
		const relation = await this.findOneOrFail({ where: { courseId, userId } });
		const result = await this.remove(relation);
		return result ? true : false;
	}
}
