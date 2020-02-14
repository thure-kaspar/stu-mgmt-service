import { Controller, Post, Body, Get, Param, ParseUUIDPipe, Delete } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserDto } from '../../shared/dto/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { CourseDto } from 'src/shared/dto/course.dto';
import { AssessmentDto } from "../../shared/dto/assessment.dto";
import { GroupDto } from "../../shared/dto/group.dto";
import { AssignmentDto } from "../../shared/dto/assignment.dto";

@ApiTags("users")
@Controller("users")
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

    @Get(":userId")
    getUserById(@Param("userId") userId: string): Promise<UserDto> {
        return this.userService.getUserById(userId);
    }

    @Get(":userId/courses")
    getCoursesOfUser(@Param("userId", ParseUUIDPipe) userId: string): Promise<CourseDto[]> {
        return this.userService.getCoursesOfUser(userId);
    }

    /**
	 *	Returns a collection of all groups the user was/is part of in the given course.
	 *	
	 * @param {string} userId
	 * @param {string} courseId
	 * @returns {Promise<GroupDto[]>}
	 * @memberof UserController
	 */
	@Get(":userId/courses/:courseId/groups")
    getGroupOfUserForCourse(
        @Param("userId", ParseUUIDPipe) userId: string,
        @Param("courseId") courseId: string,
    ): Promise<any> {

        return this.userService.getGroupsOfUserForCourse(userId, courseId);
    }

    @Get(":userId/courses/:courseId/assessmentsWithGroups")
    getAssessmentGroupMapOfUserForCourse(
        @Param("userId", ParseUUIDPipe) userId: string,
        @Param("courseId") courseId: string,
    ): Promise<{assessment: AssessmentDto, group: GroupDto}[]> {

        return this.userService.getAssessmentGroupMapOfUserForCourse(userId, courseId);
    }

    @Delete(":userId")
    deleteUser(@Param("userId") userId: string): Promise<boolean> {
        return this.userService.deleteUser(userId);
    }
}
