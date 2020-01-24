import { Course } from "./entities/course.entity";
import { CourseDto } from "./dto/course.dto";
import { UserDto } from "./dto/user.dto";
import { User } from "./entities/user.entity";
import { GroupDto } from "./dto/group.dto";
import { Group } from "./entities/group.entity";

export function createCourseDto(courseEntity: Course): CourseDto {
    const courseDto: CourseDto = {
        id: courseEntity.id,
        shortname: courseEntity.shortname,
        semester: courseEntity.semester,
        title: courseEntity.title,
        isClosed: courseEntity.isClosed,
        password: courseEntity.password,
        link: courseEntity.link
    };

    // Add relational data, if available
    if (courseEntity.courseUserRelations) {
        courseDto.users = []; 
        courseEntity.courseUserRelations.forEach(courseUserRelation => {
            courseDto.users.push(createUserDto(courseUserRelation.user));
        });
    }

    return courseDto;
}

export function createUserDto(userEntity: User): UserDto {
    const userDto: UserDto = {
        id: userEntity.id,
        email: userEntity.email,
        role: userEntity.role,
    }

    // Add relational data, if available
    if (userEntity.courseUserRelations) {
        userDto.courses = [];
        userEntity.courseUserRelations.forEach(courseUserRelation => {
            userDto.courses.push(createCourseDto(courseUserRelation.course));
        });
    }

    return userDto;
}

export function createGroupDto(groupEntity: Group): GroupDto {
    const groupDto: GroupDto = {
        id: groupEntity.id,
        name: groupEntity.name,
        isClosed:groupEntity.isClosed,
        course: groupEntity.course
    }
    return groupDto;
}
