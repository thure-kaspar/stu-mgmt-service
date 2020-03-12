import { Injectable, BadRequestException } from '@nestjs/common';
import { CourseDto } from 'src/shared/dto/course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseRepository } from '../database/repositories/course.repository';
import { Course } from '../../shared/entities/course.entity';
import { User } from '../../shared/entities/user.entity';
import { UserRepository } from '../../user/repositories/user.repository';
import { CourseUserRelation } from '../../shared/entities/course-user-relation.entity';
import { CourseUserRelationRepository } from '../database/repositories/course-user-relation.repository';
import { UserDto } from "../../shared/dto/user.dto";
import { UserRole } from "../../shared/enums";
import { CourseFilterDto } from '../../shared/dto/course-filter.dto';
import { DtoFactory } from "../../shared/dto-factory";

@Injectable()
export class CourseService {

    constructor(@InjectRepository(Course) private courseRepository: CourseRepository,
                @InjectRepository(User) private userRepository: UserRepository,
				@InjectRepository(CourseUserRelation) private courseUserRepository: CourseUserRelationRepository) { }

    async createCourse(courseDto: CourseDto): Promise<CourseDto> {
        const createdCourse = await this.courseRepository.createCourse(courseDto);
        return DtoFactory.createCourseDto(createdCourse);
	}
	
    async addUser(courseId: string, userId: string): Promise<any> { // TODO: don't return any
        return this.courseUserRepository.addUserToCourse(courseId, userId, UserRole.STUDENT); // TODO: don't hardcode role 
    }

    async getCourses(filter?: CourseFilterDto): Promise<CourseDto[]> {
		const courses = await this.courseRepository.getCourses(filter);
        return courses.map(course => DtoFactory.createCourseDto(course));
    }

    async getCourseById(id: string): Promise<CourseDto> {
        const course = await this.courseRepository.getCourseById(id);
        return DtoFactory.createCourseDto(course);
    }

    async getCourseByNameAndSemester(name: string, semester: string): Promise<CourseDto> {
        const course = await this.courseRepository.getCourseByNameAndSemester(name, semester);
        return DtoFactory.createCourseDto(course);
    }

    async getUsersOfCourse(courseId: string): Promise<UserDto[]> {
        const course = await this.courseRepository.getCourseWithUsers(courseId);
        const userDtos = course.courseUserRelations.map(courseUserRelation => DtoFactory.createUserDto(courseUserRelation.user));
        return userDtos;
    }

    async updateCourse(courseId: string, courseDto: CourseDto): Promise<CourseDto> {
        const course = await this.courseRepository.updateCourse(courseId, courseDto);
        return DtoFactory.createCourseDto(course);
	}
	
	async updateUserRole(courseId: string, userId: string, role: UserRole): Promise<boolean> {
		return this.courseUserRepository.updateUserRole(courseId, userId, role);
	}

    async deleteCourse(courseId: string): Promise<boolean> {
        return this.courseRepository.deleteCourse(courseId);
    }

}
