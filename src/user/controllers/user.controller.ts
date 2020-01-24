import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserDto } from '../../shared/dto/user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("users")
@Controller('users')
export class UserController {

    constructor(private userService: UserService) { }

    @Post()
    createUser(@Body() userDto: UserDto): Promise<UserDto> {
        return this.userService.createUser(userDto);
    }

    @Get()
    getAllUsers(): Promise<UserDto[]> {
        return this.userService.getAllUsers();
    }

    @Get(":id")
    getUserById(@Param("id") id: string): Promise<UserDto> {
        return this.userService.getUserById(id);
    }
    
}
