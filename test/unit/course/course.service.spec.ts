import { Test, TestingModule } from "@nestjs/testing";
import { CourseFilter } from "../../../src/course/dto/course/course-filter.dto";
import { CourseDto } from "../../../src/course/dto/course/course.dto";
import { CourseConfig } from "../../../src/course/entities/course-config.entity";
import { Course } from "../../../src/course/entities/course.entity";
import { CourseRepository } from "../../../src/course/repositories/course.repository";
import { CourseService } from "../../../src/course/services/course.service";
import { DtoFactory } from "../../../src/shared/dto-factory";
import { User } from "../../../src/shared/entities/user.entity";
import { COURSE_CONFIG_JAVA_1920 } from "../../mocks/course-config/course-config.mock";
import { COURSE_INFO_2_2020, COURSE_JAVA_1920 } from "../../mocks/courses.mock";
import { USER_STUDENT_2_JAVA, USER_STUDENT_JAVA } from "../../mocks/users.mock";
import { convertToEntity, copy } from "../../utils/object-helper";
import { CourseCreateDto } from "../../../src/course/dto/course/course-create.dto";

const mock_CourseRepository = () => ({
	createCourse: jest.fn().mockResolvedValue(convertToEntity(Course, COURSE_JAVA_1920)),
	getCourses: jest.fn().mockResolvedValue([
		convertToEntity(Course, COURSE_JAVA_1920),
		convertToEntity(Course, COURSE_INFO_2_2020)
	]),
	getCourseById: jest.fn().mockResolvedValue(COURSE_JAVA_1920),
	getCourseByNameAndSemester: jest.fn(),
	getCourseWithUsers: jest.fn().mockResolvedValue([
		convertToEntity(User, USER_STUDENT_JAVA),
		convertToEntity(User, USER_STUDENT_2_JAVA)
	]),
	getCourseWithConfig: jest.fn().mockImplementation(() => {
		const course = convertToEntity(Course, COURSE_JAVA_1920);
		course.config = convertToEntity(CourseConfig, COURSE_CONFIG_JAVA_1920);
		return course;
	}),
	updateCourse: jest.fn(),
	updateUserRole: jest.fn(),
	deleteCourse: jest.fn()
});

describe("CourseService", () => {

	let service: CourseService;
	let courseRepository: CourseRepository;
	let courseDto: CourseDto;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CourseService,
				{ provide: CourseRepository, useFactory: mock_CourseRepository }
			],
		}).compile();
		
		// Mock DtoFactory
		DtoFactory.createCourseDto = jest.fn();

		service = module.get<CourseService>(CourseService);
		courseRepository = module.get<CourseRepository>(CourseRepository);
		courseDto = copy(COURSE_JAVA_1920);

	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("createCourse", () => {
		let courseCreateDto: CourseCreateDto;

		beforeEach(() => { 
			courseCreateDto = {...courseDto, config: copy(COURSE_CONFIG_JAVA_1920) };
		});		
		
		it("Calls repository for creation", async () => {
			await service.createCourse(courseCreateDto);
			expect(courseRepository.createCourse).toHaveBeenCalledWith(courseDto);
		});

		it("Dto contains id -> Assigns id", async () => {
			courseDto.id = "my-id";
			await service.createCourse(courseCreateDto);
			expect(courseRepository.createCourse).toHaveBeenCalledWith(courseDto);
		});

		it("Dto does not contain id -> Assigns shortname-semester as id", async () => {
			courseDto.id = undefined;
			const expected = copy(courseDto);
			expected.id = expected.shortname + "-" + expected.semester;

			await service.createCourse(courseCreateDto);
			expect(courseRepository.createCourse).toHaveBeenCalledWith(expected);
		});

		it("Dto contains password -> Assigns password", async () => {
			courseCreateDto.config.password = "hasAPassword";
			await service.createCourse(courseCreateDto);
			expect(courseRepository.createCourse).toHaveBeenCalledWith(courseDto);
		});

		it("Returns Dto", async () => {
			await service.createCourse(courseCreateDto);
			expect(DtoFactory.createCourseDto).toHaveBeenCalled();
		});

	});

	describe("getCourses", () => {

		it("No filter -> Calls repository for retrieval", async () => {
			await service.getCourses();
			expect(courseRepository.getCourses).toHaveBeenCalled();
		});

		it("With filter -> Calls repository for retrieval with filter", async () => {
			const filter: CourseFilter = { title: "Java" };
			
			await service.getCourses(filter);

			expect(courseRepository.getCourses).toHaveBeenCalledWith(filter);
		});

		it("Returns Dto", async () => {
			await service.getCourses();
			expect(DtoFactory.createCourseDto).toHaveBeenCalled();
		});

	});

	describe("getCourseById", () => {

		it("Calls repository for retrieval", async () => {
			const id = courseDto.id;
			await service.getCourseById(id);
			expect(courseRepository.getCourseById).toHaveBeenCalledWith(id);
		});

		it("Returns Dto", async () => {
			const id = courseDto.id;
			await service.getCourseById(id);
			expect(DtoFactory.createCourseDto).toHaveBeenCalled();
		});

	});

	describe("getCourseByNameAndSemester", () => {

		it("Calls repository for retrieval", async () => {
			const name = "java";
			const semester = "wise1920";

			await service.getCourseByNameAndSemester(name, semester);

			expect(courseRepository.getCourseByNameAndSemester).toHaveBeenCalledWith(name, semester);
		});

		it("Returns Dto", async () => {
			const name = "java";
			const semester = "wise1920";

			await service.getCourseByNameAndSemester(name, semester);

			expect(DtoFactory.createCourseDto).toHaveBeenCalled();
		});
	});

	describe("updateCourse", () => {
	
		it("Calls repository for update", async () => {
			await service.updateCourse(courseDto.id, courseDto);
			expect(courseRepository.updateCourse).toHaveBeenCalledWith(courseDto.id, courseDto);
		});

		it("Returns Dto", async () => {
			await service.updateCourse(courseDto.id, courseDto);
			expect(DtoFactory.createCourseDto).toHaveBeenCalled(); 
		});
	
	});

	describe("deleteCourse", () => {
	
		it("Calls repository for deletion", async () => {
			await service.deleteCourse(courseDto.id);
			expect(courseRepository.deleteCourse).toHaveBeenCalledWith(courseDto.id);
		});
	
	});

});
