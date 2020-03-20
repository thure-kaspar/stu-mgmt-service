import { CourseRepository } from "../../../src/course/database/repositories/course.repository";
import { TestingModule, Test } from "@nestjs/testing";
import { CourseDto } from "../../../src/shared/dto/course.dto";
import { copy } from "../../utils/object-helper";
import { COURSE_JAVA_1920 } from "../../mocks/courses.mock";
import { Course } from "../../../src/shared/entities/course.entity";
import { DtoToEntityConverter } from "../../utils/dto-to-entity-converter";

describe("CourseRepository", () => {

	let repository: CourseRepository;
	let courseDto: CourseDto;
	let expected: Course;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CourseRepository
			],
		}).compile();
		
		repository = module.get<CourseRepository>(CourseRepository);
		courseDto = copy(COURSE_JAVA_1920);
		expected = DtoToEntityConverter.getCourse(COURSE_JAVA_1920);
	});

	it("Should be defined", () => {
		expect(repository).toBeDefined();
	});

	describe("createEntityFromDto", () => {
	
		it("Assigns all matching properties", () => {
			const result = repository._createEntityFromDto(courseDto);
			expect(result).toEqual(expected);
		});

		it("Dto contains id -> Assigns id", () => {
			courseDto.id = "my-id";
			const result = repository._createEntityFromDto(courseDto);
			expect(result.id).toEqual(courseDto.id);
		});

		it("Dto does not contain id -> Assigns shortname-semester as id", () => {
			courseDto.id = undefined;
			const result = repository._createEntityFromDto(courseDto);
			expect(result.id).toEqual(courseDto.shortname + "-" + courseDto.semester);
		});

		it("Dto contains password -> Assigns password", () => {
			const result = repository._createEntityFromDto(courseDto);
			expect(result.password).toEqual(courseDto.password);
		});

		it("Dto contains password with empty string (\"\") -> Assigns null to password", () => {
			courseDto.password = ""; // Empty string should be converted to null
			const result = repository._createEntityFromDto(courseDto);
			expect(result.password).toEqual(null);
		});

		it("Dto contains no password (undefined) -> Assigns null to password", () => {
			courseDto.password = undefined; // Undefined should be converted to null
			const result = repository._createEntityFromDto(courseDto);
			expect(result.password).toEqual(null);
		});
	
	});

});
