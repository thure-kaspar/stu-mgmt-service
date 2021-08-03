import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { CourseFilter } from "../../src/course/dto/course/course-filter.dto";
import { createApplication } from "../mocks/application.mock";
import {
	COURSE_CONFIG_COURSE_INFO_2_2020,
	COURSE_CONFIG_JAVA_1920
} from "../mocks/course-config/course-config.mock";
import { CoursesMock, COURSE_INFO_2_2020, COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { DbMockService } from "../mocks/db-mock.service";
import { GROUP_1_JAVA, GROUP_2_JAVA } from "../mocks/groups/groups.mock";
import { USER_STUDENT_JAVA } from "../mocks/users.mock";
import { copy } from "../utils/object-helper";
import { CourseCreateDto } from "../../src/course/dto/course/course-create.dto";

let app: INestApplication;
let dbMockService: DbMockService; // Should be initialized in every describe-block that requires data in db

const course = COURSE_JAVA_1920; // the course that will be used for testing

describe("GET-REQUESTS of CourseController (e2e)", () => {
	beforeAll(async () => {
		app = await createApplication();

		// Setup mocks
		const dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterAll(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(GET) /courses Retrieves all courses", () => {
		return request(app.getHttpServer())
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

		return request(app.getHttpServer())
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

		return request(app.getHttpServer())
			.get(`/courses?shortname=${filter.shortname}`)
			.expect(({ body }) => {
				expect(body.length).toEqual(expectedLength);
			});
	});

	it("(GET) /courses/{courseId} Retrieves the course", () => {
		return request(app.getHttpServer())
			.get(`/courses/${course.id}`)
			.expect(({ body }) => {
				expect(body.id).toEqual(course.id);
				expect(body).toMatchSnapshot();
			});
	});

	it("(GET) /courses/{name}/semester/{semester} Retrieves the course", () => {
		return request(app.getHttpServer())
			.get(`/courses/${course.shortname}/semester/${course.semester}`)
			.expect(({ body }) => {
				expect(body.id).toEqual(course.id);
			});
	});
});

describe("POST-REQUESTS of CourseController (empty db) (e2e)", () => {
	beforeEach(async () => {
		app = await createApplication();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /courses Creates the given course and returns it", () => {
		const courseToCreate: CourseCreateDto = {
			...copy(course),
			config: COURSE_CONFIG_JAVA_1920
		};

		return request(app.getHttpServer())
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
		app = await createApplication();

		// Setup mocks - all of these tests require (at least) existing courses and users
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createCourses();
		await dbMockService.createCourseConfig();
		await dbMockService.createAdmissionCriteria();
		await dbMockService.createGroupSettings();
		await dbMockService.createUsers();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /courses/{courseId}/users/{userId} No password required -> Adds user to course", () => {
		const courseNoPassword = COURSE_INFO_2_2020;
		console.assert(
			COURSE_CONFIG_COURSE_INFO_2_2020.password == undefined,
			"Course password should be undefined"
		);
		const user = USER_STUDENT_JAVA;

		return request(app.getHttpServer())
			.post(`/courses/${courseNoPassword.id}/users/${user.id}`)
			.expect(201);
	});

	it("(POST) /courses/{courseId}/users/{userId} Correct password -> Adds user to course", () => {
		const user = USER_STUDENT_JAVA;

		return request(app.getHttpServer())
			.post(`/courses/${course.id}/users/${user.id}`)
			.send({ password: COURSE_CONFIG_JAVA_1920.password }) // the correct password
			.expect(201);
	});

	it("(POST) /courses/{courseId}/users/{userId} Incorrect password -> Throws BadRequestException", () => {
		const user = USER_STUDENT_JAVA;

		return request(app.getHttpServer())
			.post(`/courses/${course.id}/users/${user.id}`)
			.send({ password: "incorrect" }) // an incorrect password
			.expect(400);
	});

	it("(POST) /courses/{courseId}/groups Creates the given group and returns it (Part 1/2)", () => {
		const group = GROUP_1_JAVA;

		return request(app.getHttpServer())
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
		app = await createApplication();

		// Setup mocks - these tests require a filled db
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(DELETE) /courses/{courseId} Deletes the course", () => {
		return request(app.getHttpServer()).delete(`/courses/${course.id}`).expect(200);
	});
});
