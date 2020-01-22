import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../repositories/user.repository';
import { User } from 'src/shared/entities/user.entity';
import { UserDto } from 'src/shared/dto/user.dto';
import * as fromDtoFactory from "../../shared/dto-factory";

@Injectable()
export class UserService {

    constructor(@InjectRepository(User) private userRepository: UserRepository) { }

    async createUser(userDto: UserDto): Promise<UserDto> {
        const createdUser = await this.userRepository.createUser(userDto);
        const createdUserDto = fromDtoFactory.createUserDto(createdUser);
        return createdUserDto;
    }

    async getAllUsers(): Promise<UserDto[]> {
        const userDtos: UserDto[] = [];
        const users = await this.userRepository.getAllUsers();
        users.forEach(user => userDtos.push(fromDtoFactory.createUserDto(user)));
        return userDtos;
    }

    async getUserById(id: string): Promise<UserDto> {
        const user = await this.userRepository.getUserById(id);
        const userDto = fromDtoFactory.createUserDto(user);
        return userDto;
    }
    
}
