import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../repositories/user.repository';
import { User } from 'src/shared/entities/user.entity';
import { UserDto } from 'src/shared/dto/user.dto';
import { CourseService } from 'src/course/services/course.service';

@Injectable()
export class UserService {

    constructor(@InjectRepository(User) private userRepository: UserRepository) { }

    async createUser(userDto: UserDto): Promise<UserDto> {
        const createdUser = await this.userRepository.createUser(userDto);
        const createdUserDto = this.createDtoFromEntity(createdUser);
        return createdUserDto;
    }

    async getAllUsers(): Promise<UserDto[]> {
        const userDtos: UserDto[] = [];
        const users = await this.userRepository.getAllUsers();
        users.forEach(user => userDtos.push(this.createDtoFromEntity(user)));
        return users;
    }

    async getUserById(id: string): Promise<UserDto> {
        const user = await this.userRepository.getUserById(id);
        const userDto = this.createDtoFromEntity(user);
        return userDto;
    }

    private createDtoFromEntity(userEntity: User): UserDto {
        const userDto: UserDto = {
            id: userEntity.id,
            email: userEntity.email,
            role: userEntity.role,
            courses: userEntity.courses
        }
        return userDto;
    }
    
}
