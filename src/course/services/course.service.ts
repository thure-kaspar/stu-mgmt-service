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
import { CourseClosedException } from "../exceptions/custom-exceptions";
import { CourseCreateDto } from "../dto/course-create.dto";

@Injectable()
export class CourseService {

	constructor(@InjectRepository(Course) private courseRepository: CourseRepository,
		@InjectRepository(CourseUserRelation) private courseUserRepository: CourseUserRelationRepository) { }

	async createCourse(courseDto: CourseCreateDto): Promise<CourseDto> {
		if (!courseDto.config) throw new BadRequestException("CourseConfig is missing.");
		if (!courseDto.config.groupSettings) throw new BadRequestException("GroupSettings are missing.");

		// If no id was supplied, <shortname-semester> will be the id
		if (!courseDto.id || courseDto.id === "")  {
			courseDto.id = courseDto.shortname + "-" + courseDto.semester; 
		}

		const course = await this.courseRepository.createCourse(courseDto);
		return DtoFactory.createCourseDto(course);
	}

	/**
	 * Adds the user to the course. 
	 * If the course requires a password, the given password must match the specified password.
	 * Throws exception, if course is closed or password does not match.
	 */
	async addUser(courseId: string, userId: string, password?: string): Promise<any> { // TODO: don't return any
		const course = await this.courseRepository.getCourseWithConfig(courseId);

		if (course.isClosed) throw new CourseClosedException();

		// Check if password is required + matches
		const requiredPassword = course.config.password;
		if (requiredPassword && requiredPassword !== password) {
			throw new BadRequestException("The given password was incorrect.");
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
