import { Repository, EntityRepository } from "typeorm";
import { User } from "../../shared/entities/user.entity";
import { UserDto } from "../../shared/dto/user.dto";
import { Course, CourseId } from "src/course/entities/course.entity";

@EntityRepository(User)
export class UserRepository extends Repository<User> {

	async createUser(userDto: UserDto): Promise<User> {
		const user = this.createEntityFromDto(userDto);
		return this.save(user);
	}

	async getAllUsers(): Promise<User[]> {
		return this.find();
	}

	async getUserById(id: string): Promise<User> {
		return this.findOneOrFail(id, { relations: ["participations", "participations.course"] });
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

	async getCoursesOfUser(userId: string): Promise<Course[]> {
		const user = await this.findOneOrFail(userId, { 
			relations: ["participations", "participations.course"] 
		});

		return user.participations.map(relation => relation.course);
	}

	/** Determines, wether the user is a member of the course. */
	async isMemberOfCourse(userId: string, courseId: CourseId): Promise<boolean> {
		const user = await this.createQueryBuilder("user")
			.where("user.id = :id", { id: userId })
			.innerJoin("user.participations", "participation")
			.andWhere("participation.courseId = :courseId", { courseId })
			.getOne();
			
		return !!user;
	} 

	async updateUser(userId: string, userDto: UserDto): Promise<User> {
		const user = await this.getUserById(userId);

		// TODO: Define Patch-Object or create method
		user.email = userDto.email;
		user.role = userDto.role;

		return this.save(user);
	}

	async deleteUser(userId: string): Promise<boolean> {
		const deleted = await this.remove(this.create({ id: userId }));
		return deleted ? true : false;
	}
	
	private createEntityFromDto(userDto: UserDto): User {
		const user = new User();
		user.email = userDto.email;
		user.role = userDto.role;
		user.username = userDto.username;
		user.rzName = userDto.rzName;
		return user;
	}
}
