import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection } from 'typeorm';
import { CourseDto } from '../src/shared/dto/course.dto';

const courses: CourseDto[] = [
	{ 
		id: "java-wise1920", 
		shortname: "java", 
		semester: "wise1920", 
		title: "Programmierpraktikum I: Java", 
		isClosed: false, 
		password: "java", 
		link: "test.test" 
	},
	{ 
		id: "info2-sose2020", 
		shortname: "info2", 
		semester: "sose2020", 
		title: "Informatik II: Algorithmen und Datenstrukturen", 
		isClosed: true, 
		password: "info2", 
		link: "test.test" 
	},
]

describe('CourseController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await getConnection().dropDatabase();
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /courses Creates the given course and returns it (Part 1/2)", () => {
		return request(app.getHttpServer())
			.post("/courses")
			.send(courses[0])
			.expect(201)
			.expect(({ body }) => {
				expect(body.shortname).toEqual(courses[0].shortname); // Can't compare entire objects, because property "password" is not sent to clients
			})
	});
	
	it("(POST) /courses Creates the given course returns it (Part 2/2)", () => {
		return request(app.getHttpServer())
		.post("/courses")
		.send(courses[1])
		.expect(201)
		.expect(({ body }) => {
			expect(body.shortname).toEqual(courses[1].shortname); // Can't compare entire objects, because property "password" is not sent to clients
		})
	});

	it("(GET) /courses Retrieves all courses", () => {
		return request(app.getHttpServer())
			.get("/courses")
			.expect(({ body }) => {
				expect(body.length).toEqual(courses.length); 
			});
	});

});
