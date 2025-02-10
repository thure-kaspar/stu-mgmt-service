import { Repository, In, DataSource } from "typeorm";
import { User, UserId } from "../../shared/entities/user.entity";
import { UserDto, UserUpdateDto } from "../../shared/dto/user.dto";
import { Course, CourseId } from "src/course/entities/course.entity";
import { UserFilter } from "../dto/user.filter";
import { UserSettings } from "../entities/user-settings.entity";
import { Language } from "../../shared/language";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRepository extends Repository<User> {
	constructor(private dataSource: DataSource) {
		super(User, dataSource.createEntityManager());
	  }
	  
	async createUser(userDto: UserDto): Promise<User> {
		const createdUser = await this.manager.transaction(async transaction => {
			const user = this.createEntityFromDto(userDto);
			const createdUser = await transaction.save(user);

			const userSettingsRepository = transaction.getRepository(UserSettings);
			await userSettingsRepository.insert({
				userId: createdUser.id,
				allowEmails: true,
				language: Language.DE,
				blacklistedEvents: null
			});

			return createdUser;
		});

		return createdUser;
	}

	async getUsers(filter?: UserFilter): Promise<[User[], number]> {
		const { username, displayName, roles, skip, take } = filter || {};

		const query = this.createQueryBuilder("user")
			.orderBy("user.username")
			.skip(skip)
			.take(take);

		if (username) {
			query.andWhere("user.username ILIKE :username", { username: `%${username}%` });
		}

		if (displayName) {
			query.andWhere("user.displayName ILIKE :displayName", {
				displayName: `%${displayName}%`
			});
		}

		if (roles?.length > 0) {
			query.andWhere("user.role IN (:...roles)", { roles });
		}

		return query.getManyAndCount();
	}

	async tryFindUsersByMatrNr(matrNrs: number[]): Promise<User[]> {
		return this.find({
			where: { matrNr: In(matrNrs) }
		});
	}

	async getUserById(id: string): Promise<User> {
		return this.findOneOrFail({where: { id }, 
			relations: ["participations", "participations.course"] });
	}

	async getUserByMatrNr(matrNr: number): Promise<User> {
		return this.findOneOrFail({
			where: { matrNr },
			relations: ["participations", "participations.course"]
		});
	}

	async getUserByEmail(email: string): Promise<User> {
		return this.findOneOrFail({
			where: { email },
			relations: ["participations", "participations.course"]
		});
	}

	async getUserByUsername(username: string): Promise<User> {
		return this.findOneOrFail({
			where: { username },
			relations: ["participations", "participations.course"]
		});
	}

	async tryGetUserByUsername(username: string): Promise<User> {
		return this.findOne({
			where: { username },
			relations: ["participations", "participations.course"]
		});
	}

	async getCoursesOfUser(userId: UserId): Promise<Course[]> {
		const user = await this.findOneOrFail({where: { id: userId }, 
			relations: ["participations", "participations.course"] });

		return user.participations.map(relation => relation.course);
	}

	/** Determines, wether the user is a member of the course. */
	async isMemberOfCourse(userId: UserId, courseId: CourseId): Promise<boolean> {
		const user = await this.createQueryBuilder("user")
			.where("user.id = :id", { id: userId })
			.innerJoin("user.participations", "participation")
			.andWhere("participation.courseId = :courseId", { courseId })
			.getOne();

		return !!user;
	}

	async updateUser(userId: UserId, userDto: UserUpdateDto): Promise<User> {
		const user = await this.getUserById(userId);

		user.email = userDto.email;
		user.matrNr = userDto.matrNr;
		user.displayName = userDto.displayName;
		user.role = userDto.role;

		await this.save(user);
		return this.getUserById(userId);
	}

	async deleteUser(userId: UserId): Promise<boolean> {
		const deleted = await this.remove(this.create({ id: userId }));
		return deleted ? true : false;
	}

	private createEntityFromDto(userDto: UserDto): User {
		const user = new User();
		user.email = userDto.email;
		user.role = userDto.role;
		user.username = userDto.username;
		user.displayName = userDto.displayName;
		return user;
	}
}
