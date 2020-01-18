import { Injectable } from '@nestjs/common';
import { CourseDto } from 'src/shared/dto/course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseRepository } from '../repositories/course.repository';
import { Course } from 'src/shared/entities/course.entity';
import { User } from 'src/shared/entities/user.entity';
import { UserRepository } from 'src/user/repositories/user.repository';
import { CourseUserRelation } from 'src/shared/entities/course-user-relation.entity';
import { CourseUserRelationRepository } from '../repositories/course-user-relation.repository';

@Injectable()
export class CourseService {

    constructor(@InjectRepository(Course) private courseRepository: CourseRepository,
                @InjectRepository(User) private userRepository: UserRepository,
                @InjectRepository(CourseUserRelation) private courseUserRepository: CourseUserRelationRepository) { }

    async createCourse(courseDto: CourseDto): Promise<CourseDto> {
        const createdCourse = await this.courseRepository.createCourse(courseDto);
        return this.createDtoFromEntity(createdCourse);
    }

    async addUser(id: number, userId: string): Promise<any> {
        const course = await this.courseRepository.getCourseById(id);
        const user = await this.userRepository.getUserById(userId);
        return await this.courseUserRepository.addUserToCourse(course, user);
    }

    async getAllCourses(): Promise<CourseDto[]> {
        const courseDtos: CourseDto[] = [];
        const courses = await this.courseRepository.getAllCourses();
        courses.forEach(course => courseDtos.push(this.createDtoFromEntity(course)));
        return courseDtos;
    }

    async getCourseById(id: number): Promise<CourseDto> {
        const course = await this.courseRepository.getCourseById(id);
        const courseDto = this.createDtoFromEntity(course);
        return courseDto;
    }

    async getCourseByCourseIdAndSemester(courseId: number, semester: string): Promise<CourseDto> {
        const course = await this.courseRepository.getCourseByCourseIdAndSemester(courseId, semester);
        const courseDto = this.createDtoFromEntity(course);
        return courseDto;
    }

    private createDtoFromEntity(courseEntity: Course): CourseDto {
        const courseDto: CourseDto = {
            id: courseEntity.id,
            courseId: courseEntity.courseId,
            semester: courseEntity.semester,
            title: courseEntity.title,
            isClosed: courseEntity.isClosed,
            password: courseEntity.password,
            link: courseEntity.link,
        };
        return courseDto;
    }

}
