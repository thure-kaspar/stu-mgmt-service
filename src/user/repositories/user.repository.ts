import { Repository, EntityRepository } from "typeorm";
import { User } from "src/shared/entities/user.entity";
import { UserDto } from "src/shared/dto/user.dto";
import { ParseUUIDPipe } from "@nestjs/common";

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
        return await this.findOne(id);
    }

    private createEntityFromDto(userDto: UserDto): User {
        const user = new User();
        user.email = userDto.email;
        user.role = userDto.role;
        return user;
    }
}