import { Test, TestingModule } from "@nestjs/testing";
import { CourseDto } from "../../../src/course/dto/course/course.dto";
import { CourseConfig } from "../../../src/course/entities/course-config.entity";
import { CourseUserRelation } from "../../../src/course/entities/course-user-relation.entity";
import { Course } from "../../../src/course/entities/course.entity";
import { CourseUserRelationRepository } from "../../../src/course/repositories/course-user-relation.repository";
import { CourseUserRepository } from "../../../src/course/repositories/course-user-repository";
import { CourseRepository } from "../../../src/course/repositories/course.repository";
import { CourseParticipantsService } from "../../../src/course/services/course-participants.service";
import { DtoFactory } from "../../../src/shared/dto-factory";
import { User } from "../../../src/shared/entities/user.entity";
import { CourseRole } from "../../../src/shared/enums";
import { COURSE_CONFIG_JAVA_1920 } from "../../mocks/course-config/course-config.mock";
import { COURSE_INFO_2_2020, COURSE_JAVA_1920 } from "../../mocks/courses.mock";
import { USER_STUDENT_2_JAVA, USER_STUDENT_JAVA } from "../../mocks/users.mock";
import { convertToEntity, copy } from "../../utils/object-helper";

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


const mock_CourseUserRelationRepository = () => ({
	createCourseUserRelation: jest.fn(),
	updateRole: jest.fn(),
});

const mock_CourseUserRepository = () => ({
	getUsersOfCourse: jest.fn().mockImplementation(() => {
		const user1 = convertToEntity(User, USER_STUDENT_JAVA);
		user1.courseUserRelations =  [new CourseUserRelation()];
		user1.courseUserRelations[0].role = CourseRole.STUDENT;

		const user2 = convertToEntity(User, USER_STUDENT_2_JAVA);
		user2.courseUserRelations = [new CourseUserRelation()];
		user2.courseUserRelations[0].role = CourseRole.STUDENT;

		const users = [user1, user2];
		const count = users.length;

		return [users, count];
	})
});

describe("CourseParticipantsService", () => {

	let service: CourseParticipantsService;
	let courseRepository: CourseRepository;
	let courseUserRelationRepository: CourseUserRelationRepository;
	let courseUserRepository: CourseUserRepository;
	let courseDto: CourseDto;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CourseParticipantsService,
				{ provide: CourseRepository, useFactory: mock_CourseRepository },
				{ provide: CourseUserRelationRepository, useFactory: mock_CourseUserRelationRepository },
				{ provide: CourseUserRepository, useFactory: mock_CourseUserRepository }
			],
		}).compile();
		
		// Mock DtoFactory
		DtoFactory.createCourseDto = jest.fn();

		service = module.get(CourseParticipantsService);
		courseRepository = module.get(CourseRepository);
		courseUserRelationRepository = module.get(CourseUserRelationRepository);
		courseUserRepository = module.get(CourseUserRepository);
		courseDto = copy(COURSE_JAVA_1920);

	});

	it("should be defined", () => {
		expect(service).toBeDefined();
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

			expect(courseUserRelationRepository.createCourseUserRelation).toBeCalledWith(courseDto.id, userId, role);
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

			expect(courseUserRelationRepository.createCourseUserRelation).toBeCalledWith(courseDto.id, userId, role);
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

	describe("getUsersOfCourse", () => {

		it("Calls repository to load with users", async () => {
			const id = courseDto.id;
			const filter = undefined;
			await service.getUsersOfCourse(id);
			expect(courseUserRepository.getUsersOfCourse).toHaveBeenCalledWith(id, filter);
		});

	});

	describe("updateRole", () => {
	
		it("Calls repository for update of role", async () => {
			const courseId = courseDto.id;
			const userId = "user_id";
			const role = CourseRole.TUTOR;

			await service.updateRole(courseId, userId, role);

			expect(courseUserRelationRepository.updateRole).toHaveBeenCalledWith(courseId, userId, role);
		});
	
	});

});
