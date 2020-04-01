import { Injectable, BadRequestException } from "@nestjs/common";
import { CourseDto } from "src/shared/dto/course.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseRepository } from "../database/repositories/course.repository";
import { Course } from "../../shared/entities/course.entity";
import { CourseUserRelation } from "../../shared/entities/course-user-relation.entity";
import { CourseUserRelationRepository } from "../database/repositories/course-user-relation.repository";
import { UserDto } from "../../shared/dto/user.dto";
import { CourseRole } from "../../shared/enums";
import { CourseFilterDto } from "../../shared/dto/course-filter.dto";
import { DtoFactory } from "../../shared/dto-factory";
import { CourseConfigDto } from "../../shared/dto/course-config.dto";

@Injectable()
export class CourseService {

	constructor(@InjectRepository(Course) private courseRepository: CourseRepository,
				@InjectRepository(CourseUserRelation) private courseUserRepository: CourseUserRelationRepository) { }

	async createCourse(courseDto: CourseDto): Promise<CourseDto> {
		const createdCourse = await this.courseRepository.createCourse(courseDto);
		return DtoFactory.createCourseDto(createdCourse);
	}
	
	/**
	 * Adds the user to the course. 
	 * If the course requires a password, the given password must match the specified password.
	 */
	async addUser(courseId: string, userId: string, password?: string): Promise<any> { // TODO: don't return any
		// Check if password is required + matches
		const course = await this.courseRepository.getCourseById(courseId);
		if (course.password) {
			if (course.password !== password) {
				throw new BadRequestException("The given password was incorrect.");
			}
		}

		return this.courseUserRepository.createCourseUserRelation(courseId, userId, CourseRole.STUDENT); 
	}

	async getCourses(filter?: CourseFilterDto): Promise<CourseDto[]> {
		const courses = await this.courseRepository.getCourses(filter);
		return courses.map(course => DtoFactory.createCourseDto(course));
	}

	async getCourseById(id: string): Promise<CourseDto> {
		const course = await this.courseRepository.getCourseById(id);
		return DtoFactory.createCourseDto(course);
	}

	/**
	 * Returns a CourseConfigDto containing all properties that describe a course's configuration.
	 */
	async getCourseConfig(id: string): Promise<CourseConfigDto> {
		const course = await this.courseRepository.getCourseConfig(id);

		// Extract lecturers (response only includes lecturers)
		const lecturers = course.courseUserRelations.map(r => DtoFactory.createUserDto(r.user));
		// Get rid of users (we don't want to include them in CourseDto)
		course.courseUserRelations = undefined;

		const config: CourseConfigDto = {
			course: DtoFactory.createCourseDto(course),
			lecturers: lecturers
		};

		return config;
	}

	async getCourseByNameAndSemester(name: string, semester: string): Promise<CourseDto> {
		const course = await this.courseRepository.getCourseByNameAndSemester(name, semester);
		return DtoFactory.createCourseDto(course);
	}

	async getUsersOfCourse(courseId: string): Promise<UserDto[]> {
		const course = await this.courseRepository.getCourseWithUsers(courseId);
		const userDtos = course.courseUserRelations.map(courseUserRelation => DtoFactory.createUserDto(courseUserRelation.user, courseUserRelation.role));
		return userDtos;
	}

	async updateCourse(courseId: string, courseDto: CourseDto): Promise<CourseDto> {
		const course = await this.courseRepository.updateCourse(courseId, courseDto);
		return DtoFactory.createCourseDto(course);
	}
	
	async updateRole(courseId: string, userId: string, role: CourseRole): Promise<boolean> {
		return this.courseUserRepository.updateRole(courseId, userId, role);
	}

	async deleteCourse(courseId: string): Promise<boolean> {
		return this.courseRepository.deleteCourse(courseId);
	}

	async removeUser(courseId: string, userId: string): Promise<boolean> {
		return await this.courseUserRepository.removeUser(courseId, userId);
	}

}
