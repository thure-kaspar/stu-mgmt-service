import { getConnection } from "typeorm";
import { CourseCreateDto } from "../../src/course/dto/course/course-create.dto";
import { CourseFilter } from "../../src/course/dto/course/course-filter.dto";
import {
	COURSE_CONFIG_COURSE_INFO_2_2020,
	COURSE_CONFIG_JAVA_1920
} from "../mocks/course-config/course-config.mock";
import { CoursesMock, COURSE_INFO_2_2020, COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { GROUP_1_JAVA } from "../mocks/groups/groups.mock";
import { USER_STUDENT_JAVA } from "../mocks/users.mock";
import { TestSetup } from "../utils/e2e";
import { copy } from "../utils/object-helper";

const course = COURSE_JAVA_1920; // the course that will be used for testing

describe("Courses E2E", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("GET-REQUESTS of CourseController (e2e)", () => {
		beforeAll(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		it("(GET) /courses Retrieves all courses", () => {
			return setup
				.request()
				.get("/courses")
				.expect(({ body }) => {
					expect(body.length).toEqual(CoursesMock.length);
				});
		});

		it("(GET) /courses With filter -> Retrieves the filtered courses", () => {
			const filter: CourseFilter = {
				shortname: "java",
				title: "Programmier"
			};

			return setup
				.request()
				.get(`/courses?shortname=${filter.shortname}&title=${filter.title}`)
				.expect(({ body }) => {
					expect(body.length).toEqual(3);
				});
		});

		it("(GET) /courses With filter -> Retrieves all iterations of the course", () => {
			const filter: CourseFilter = {
				shortname: "java"
			};

			const expectedLength = CoursesMock.filter(c => c.shortname === filter.shortname).length;
			console.assert(
				expectedLength > 1,
				"The should be multiple course with the same shortname."
			);

			return setup
				.request()
				.get(`/courses?shortname=${filter.shortname}`)
				.expect(({ body }) => {
					expect(body.length).toEqual(expectedLength);
				});
		});

		it("(GET) /courses/{courseId} Retrieves the course", () => {
			return setup
				.request()
				.get(`/courses/${course.id}`)
				.expect(({ body }) => {
					expect(body.id).toEqual(course.id);
					expect(body).toMatchSnapshot();
				});
		});

		it("(GET) /courses/{name}/semester/{semester} Retrieves the course", () => {
			return setup
				.request()
				.get(`/courses/${course.shortname}/semester/${course.semester}`)
				.expect(({ body }) => {
					expect(body.id).toEqual(course.id);
				});
		});
	});

	describe("POST-REQUESTS of CourseController (empty db) (e2e)", () => {
		beforeEach(async () => {
			await setup.clearDb();
		});

		it("(POST) /courses Creates the given course and returns it", () => {
			const courseToCreate: CourseCreateDto = {
				...copy(course),
				config: COURSE_CONFIG_JAVA_1920
			};

			return setup
				.request()
				.post("/courses")
				.send(courseToCreate)
				.expect(201)
				.expect(({ body }) => {
					expect(body.shortname).toEqual(course.shortname);
				});
		});
	});

	describe("POST-REQUESTS for relations (db contains data) of CourseController (e2e)", () => {
		beforeEach(async () => {
			await setup.clearDb();
			await setup.dbMockService.createCourses();
			await setup.dbMockService.createCourseConfig();
			await setup.dbMockService.createAdmissionCriteria();
			await setup.dbMockService.createGroupSettings();
			await setup.dbMockService.createUsers();
		});

		it("(POST) /courses/{courseId}/users/{userId} No password required -> Adds user to course", () => {
			const courseNoPassword = COURSE_INFO_2_2020;
			console.assert(
				COURSE_CONFIG_COURSE_INFO_2_2020.password == undefined,
				"Course password should be undefined"
			);
			const user = USER_STUDENT_JAVA;

			return setup
				.request()
				.post(`/courses/${courseNoPassword.id}/users/${user.id}`)
				.expect(201);
		});

		it("(POST) /courses/{courseId}/users/{userId} Correct password -> Adds user to course", () => {
			const user = USER_STUDENT_JAVA;

			return setup
				.request()
				.post(`/courses/${course.id}/users/${user.id}`)
				.send({ password: COURSE_CONFIG_JAVA_1920.password }) // the correct password
				.expect(201);
		});

		it("(POST) /courses/{courseId}/users/{userId} Incorrect password -> Throws BadRequestException", () => {
			const user = USER_STUDENT_JAVA;

			return setup
				.request()
				.post(`/courses/${course.id}/users/${user.id}`)
				.send({ password: "incorrect" }) // an incorrect password
				.expect(400);
		});

		it("(POST) /courses/{courseId}/groups Creates the given group and returns it (Part 1/2)", () => {
			const group = GROUP_1_JAVA;

			return setup
				.request()
				.post(`/courses/${COURSE_JAVA_1920.id}/groups`)
				.send(group)
				.expect(201)
				.expect(({ body }) => {
					expect(body.name).toEqual(group.name);
				});
		});
	});

	describe("DELETE-REQUESTS (Db contains data) of CourseController (e2e)", () => {
		beforeEach(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		it("(DELETE) /courses/{courseId} Deletes the course", () => {
			return setup.request().delete(`/courses/${course.id}`).expect(200);
		});
	});
});
