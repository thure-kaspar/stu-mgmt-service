import { Test, TestingModule } from "@nestjs/testing";
import { CourseUserRelationRepository } from "../../../src/course/database/repositories/course-user-relation.repository";
import { CourseRepository } from "../../../src/course/database/repositories/course.repository";
import { CourseService } from "../../../src/course/services/course.service";
import { DtoFactory } from "../../../src/shared/dto-factory";
import { CourseFilterDto } from "../../../src/course/dto/course/course-filter.dto";
import { CourseDto } from "../../../src/course/dto/course/course.dto";
import { CourseRole } from "../../../src/shared/enums";
import { COURSE_JAVA_1920, COURSE_INFO_2_2020 } from "../../mocks/courses.mock";
import { copy, convertToEntity } from "../../utils/object-helper";
import { USER_STUDENT_JAVA, USER_STUDENT_2_JAVA } from "../../mocks/users.mock";
import { CourseUserRelation } from "../../../src/course/entities/course-user-relation.entity";
import { User } from "../../../src/shared/entities/user.entity";
import { COURSE_CONFIG_JAVA_1920 } from "../../mocks/course-config/course-config.mock";
import { Course } from "../../../src/course/entities/course.entity";
import { CourseConfig } from "../../../src/course/entities/course-config.entity";

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


const mock_CourseUserRepository = () => ({
	createCourseUserRelation: jest.fn(),
	updateRole: jest.fn(),
});

describe("CourseService", () => {

	let service: CourseService;
	let courseRepository: CourseRepository;
	let courseUserRepository: CourseUserRelationRepository;
	let courseDto: CourseDto;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CourseService,
				{ provide: CourseRepository, useFactory: mock_CourseRepository },
				{ provide: CourseUserRelationRepository, useFactory: mock_CourseUserRepository }
			],
		}).compile();
		
		// Mock DtoFactory
		DtoFactory.createCourseDto = jest.fn();

		service = module.get<CourseService>(CourseService);
		courseRepository = module.get<CourseRepository>(CourseRepository);
		courseUserRepository = module.get<CourseUserRelationRepository>(CourseUserRelationRepository);
		courseDto = copy(COURSE_JAVA_1920);

	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("createCourse", () => {

		beforeEach(() => { 
			courseDto.config = copy(COURSE_CONFIG_JAVA_1920);
		});		
		
		it("Calls repository for creation", async () => {
			await service.createCourse(courseDto);
			expect(courseRepository.createCourse).toHaveBeenCalledWith(courseDto);
		});

		it("Dto contains id -> Assigns id", async () => {
			courseDto.id = "my-id";
			await service.createCourse(courseDto);
			expect(courseRepository.createCourse).toHaveBeenCalledWith(courseDto);
		});

		it("Dto does not contain id -> Assigns shortname-semester as id", async () => {
			courseDto.id = undefined;
			const expected = copy(courseDto);
			expected.id = expected.shortname + "-" + expected.semester;

			await service.createCourse(courseDto);
			expect(courseRepository.createCourse).toHaveBeenCalledWith(expected);
		});

		it("Dto contains password -> Assigns password", async () => {
			courseDto.config.password = "hasAPassword";
			await service.createCourse(courseDto);
			expect(courseRepository.createCourse).toHaveBeenCalledWith(courseDto);
		});

		it("Returns Dto", async () => {
			await service.createCourse(courseDto);
			expect(DtoFactory.createCourseDto).toHaveBeenCalled();
		});

	});

	describe("addUser", () => {

		beforeEach(() => {
			courseDto.config = copy(COURSE_CONFIG_JAVA_1920);
		});

		it("Correct password -> Calls repository for relation creation", async () => {
			console.assert(courseDto.config.password.length > 0, "Course should have a password");
			const userId = "user_id";
			const role = CourseRole.STUDENT;

			await service.addUser(courseDto.id, userId, courseDto.config.password);

			expect(courseUserRepository.createCourseUserRelation).toBeCalledWith(courseDto.id, userId, role);
		});

		it("No password required -> Calls repository for relation creation", async () => {	
			// Mock should return course that doesn't require a password
			courseRepository.getCourseWithConfig = jest.fn().mockImplementationOnce(() => {
				const course = convertToEntity(Course, COURSE_JAVA_1920);
				course.config = convertToEntity(CourseConfig, COURSE_CONFIG_JAVA_1920);
				course.config.password = null;
				return course;
			});
			const userId = "user_id";
			const password = "incorrect";
			const role = CourseRole.STUDENT;

			await service.addUser(courseDto.id, userId);

			expect(courseUserRepository.createCourseUserRelation).toBeCalledWith(courseDto.id, userId, role);
		});

		it("Incorrect password -> Throws Exception", async () => {
			console.assert(courseDto.config.password.length > 0, "Course should have a password");
			const userId = "user_id";
			const password = "incorrect";

			try {
				await service.addUser(courseDto.id, userId, password);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(400);
			}
		});

	});

	describe("getCourses", () => {

		it("No filter -> Calls repository for retrieval", async () => {
			await service.getCourses();
			expect(courseRepository.getCourses).toHaveBeenCalled();
		});

		it("With filter -> Calls repository for retrieval with filter", async () => {
			const filter: CourseFilterDto = { title: "Java" };
			
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

	describe("getUsersOfCourse", () => {

		it("Calls repository to load with users", async () => {
			const id = courseDto.id;
			const course = convertToEntity(Course, courseDto);
			// Mock user relations
			const relation = new CourseUserRelation();
			relation.user = new User();
			relation.role = CourseRole.STUDENT;
			course.courseUserRelations = [relation];
			courseRepository.getCourseWithUsers = jest.fn().mockResolvedValueOnce(course);

			await service.getUsersOfCourse(id);
			expect(courseRepository.getCourseWithUsers).toHaveBeenCalledWith(id);
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

	describe("updateRole", () => {
	
		it("Calls repository for update of role", async () => {
			const courseId = courseDto.id;
			const userId = "user_id";
			const role = CourseRole.TUTOR;

			await service.updateRole(courseId, userId, role);

			expect(courseUserRepository.updateRole).toHaveBeenCalledWith(courseId, userId, role);
		});
	
	});

	describe("deleteCourse", () => {
	
		it("Calls repository for deletion", async () => {
			await service.deleteCourse(courseDto.id);
			expect(courseRepository.deleteCourse).toHaveBeenCalledWith(courseDto.id);
		});
	
	});

});
