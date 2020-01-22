import { Course } from "./entities/course.entity";
import { CourseDto } from "./dto/course.dto";
import { UserDto } from "./dto/user.dto";
import { User } from "./entities/user.entity";
import { CourseUserRelation } from "./entities/course-user-relation.entity";

export function createCourseDto(courseEntity: Course): CourseDto {
    const courseDto: CourseDto = {
        id: courseEntity.id,
        courseId: courseEntity.courseId,
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