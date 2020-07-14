import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseDto } from "src/course/dto/course/course.dto";
import { DtoFactory } from "../../shared/dto-factory";
import { CourseCreateDto } from "../dto/course/course-create.dto";
import { CourseFilter } from "../dto/course/course-filter.dto";
import { Course } from "../entities/course.entity";
import { CourseRepository } from "../repositories/course.repository";

@Injectable()
export class CourseService {

	constructor(@InjectRepository(Course) private courseRepository: CourseRepository) { }

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

	async getCourses(filter?: CourseFilter): Promise<CourseDto[]> {
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

	async updateCourse(courseId: string, courseDto: CourseDto): Promise<CourseDto> {
		const course = await this.courseRepository.updateCourse(courseId, courseDto);
		return DtoFactory.createCourseDto(course);
	}

	async deleteCourse(courseId: string): Promise<boolean> {
		return this.courseRepository.deleteCourse(courseId);
	}

}
