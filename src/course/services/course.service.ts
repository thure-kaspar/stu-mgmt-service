import { Injectable } from '@nestjs/common';
import { CourseDto } from 'src/shared/dto/course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseRepository } from '../repositories/course.repository';
import { Course } from '../../shared/entities/course.entity';
import { User } from '../../shared/entities/user.entity';
import { UserRepository } from '../../user/repositories/user.repository';
import { CourseUserRelation } from '../../shared/entities/course-user-relation.entity';
import { CourseUserRelationRepository } from '../repositories/course-user-relation.repository';
import * as fromDtoFactory from "../../shared/dto-factory";
import { GroupDto } from '../../shared/dto/group.dto';

@Injectable()
export class CourseService {

    constructor(@InjectRepository(Course) private courseRepository: CourseRepository,
                @InjectRepository(User) private userRepository: UserRepository,
				@InjectRepository(CourseUserRelation) private courseUserRepository: CourseUserRelationRepository) { }

    async createCourse(courseDto: CourseDto): Promise<CourseDto> {
        const createdCourse = await this.courseRepository.createCourse(courseDto);
        return fromDtoFactory.createCourseDto(createdCourse);
	}
	
    async addUser(id: string, userId: string): Promise<any> {
        const course = await this.courseRepository.getCourseById(id);
        const user = await this.userRepository.getUserById(userId);
        return await this.courseUserRepository.addUserToCourse(course, user);
    }

    async getAllCourses(): Promise<CourseDto[]> {
        const courseDtos: CourseDto[] = [];
        const courses = await this.courseRepository.getAllCourses();
        courses.forEach(course => courseDtos.push(fromDtoFactory.createCourseDto(course)));
        return courseDtos;
    }

    async getCourseById(id: string): Promise<CourseDto> {
        const course = await this.courseRepository.getCourseById(id);
        const courseDto = fromDtoFactory.createCourseDto(course);
        return courseDto;
    }

    async getCourseByNameAndSemester(name: string, semester: string): Promise<CourseDto> {
        const course = await this.courseRepository.getCourseByNameAndSemester(name, semester);
        const courseDto = fromDtoFactory.createCourseDto(course);
        return courseDto;
    }

}
