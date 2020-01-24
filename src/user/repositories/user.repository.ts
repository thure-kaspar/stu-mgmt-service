import { Repository, EntityRepository } from "typeorm";
import { User } from "../../shared/entities/user.entity";
import { UserDto } from "../../shared/dto/user.dto";
import { Course } from "src/shared/entities/course.entity";

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    async createUser(userDto: UserDto): Promise<User> {
        const user = this.createEntityFromDto(userDto);
        return await user.save();
    }

    async getAllUsers(): Promise<User[]> {
        return await this.find();
    }

    async getUserById(id: string): Promise<User> {
        return await this.findOne(id, { relations: ["courseUserRelations", "courseUserRelations.course"] });
    }

    async getCoursesOfUser(userId: string): Promise<Course[]> {
        const user = await this.findOne(userId, { relations: ["courseUserRelations", "courseUserRelations.course"] });
        const courses = [];

        if (user.courseUserRelations) {
            user.courseUserRelations.forEach(courseUserRelation => {
                courses.push(courseUserRelation.course);
            });
        }

        return courses;
    }

    private createEntityFromDto(userDto: UserDto): User {
        const user = new User();
        user.email = userDto.email;
        user.role = userDto.role;
        return user;
    }
}
