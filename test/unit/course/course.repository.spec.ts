import { CourseRepository } from "../../../src/course/database/repositories/course.repository";
import { TestingModule, Test } from "@nestjs/testing";
import { CourseDto } from "../../../src/shared/dto/course.dto";
import { copy, convertToEntity } from "../../utils/object-helper";
import { COURSE_JAVA_1920 } from "../../mocks/courses.mock";
import { Course } from "../../../src/shared/entities/course.entity";

describe("CourseRepository", () => {

	let repository: CourseRepository;
	let courseDto: CourseDto;
	let expected: Course;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CourseRepository,
			],
		}).compile();
		
		repository = module.get<CourseRepository>(CourseRepository);
		courseDto = copy(COURSE_JAVA_1920);
		expected = convertToEntity(Course, COURSE_JAVA_1920);
	});

	it("Should be defined", () => {
		expect(repository).toBeDefined();
	});

});
