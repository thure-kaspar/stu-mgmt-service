import { ConflictException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { Participant } from "../entities/participant.entity";
import { CourseRole } from "../../shared/enums";
import { CourseId } from "../entities/course.entity";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { CourseParticipantsFilter } from "../dto/course-participant/course-participants.filter";

@EntityRepository(Participant)
export class ParticipantRepository extends Repository<Participant> {
	
	async createParticipant(courseId: CourseId, userId: string, role: CourseRole): Promise<Participant> {
		const participant = new Participant();
		participant.courseId = courseId;
		participant.userId = userId;
		participant.role = role;

		await this.save(participant)
			.catch((error) => {
				if (error.code === "23505") { // TODO: Store error codes in enum
					throw new ConflictException("This user is already signed up to the course.");
				}
			});

		return participant;
	}

	/**
	 * Returns the participants of a course.
	 */
	async getParticipants(courseId: CourseId, filter?: CourseParticipantsFilter): Promise<[Participant[], number]> {
		const { courseRole, username, skip, take } = filter || { };

		const query = this.createQueryBuilder("participant")
			.where("participant.courseId = :courseId", { courseId })
			.innerJoinAndSelect("participant.user", "user")
			.orderBy("participant.role", "ASC")
			.addOrderBy("user.username", "ASC")
			.skip(skip)
			.take(take);

		if (username) {
			query.andWhere("user.username ILIKE :username", { username: `%${username}%`});
		}
	
		if (courseRole?.length > 0) {
			query.andWhere("participant.role IN (:...courseRole)", { courseRole });
		}

		return query.getManyAndCount();
	}

	/**
	 * Returns a specific participant of a course.
	 * Throws `EntityNotFoundError` if participant does not exist.
	 * 
	 * Includes relations:
	 * - Group (if exists, includes members)
	 */
	async getParticipant(courseId: CourseId, userId: string): Promise<Participant> {
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

	async updateRole(courseId: CourseId, userId: string, role: CourseRole): Promise<boolean> {
		const relation = await this.findOneOrFail({ where: { courseId, userId } });
		relation.role = role;
		const updated = await this.save(relation);
		return updated ? true : false;
	}

	async removeUser(courseId: CourseId, userId: string): Promise<boolean> {
		const relation = await this.findOneOrFail({ where: { courseId, userId } });
		const result = await this.remove(relation);
		return result ? true : false;
	}
}
