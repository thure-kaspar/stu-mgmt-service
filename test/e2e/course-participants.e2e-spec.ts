import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { ParticipantsComparisonDto } from "../../src/course/queries/compare-participants-list/participants-comparison.dto";
import { createApplication } from "../mocks/application.mock";
import { COURSE_JAVA_1819, COURSE_JAVA_1920, COURSE_JAVA_2020 } from "../mocks/courses.mock";
import { DbMockService } from "../mocks/db-mock.service";

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

	describe("/courses/{courseId}/users/compare-participants-list", () => {
	
		it("Returns a comparison of participants", () => {
			const queryString = `compareToCourseIds=${COURSE_JAVA_2020.id}&compareToCourseIds=${COURSE_JAVA_1819.id}`;

			return request(app.getHttpServer())
				.get(`/courses/${course.id}/users/compare-participants-list?${queryString}`)
				.expect(200)
				.expect(({ body }) => {
					const result = body as ParticipantsComparisonDto;
					expect(result.inComparedCourses.length).toEqual(2);
					expect(result.notInComparedCourses.length).toEqual(5); // TODO: Scalable conditions 
				});
		});

		it("Throws 404 if no courseIds for comparison were specified", () => {
			return request(app.getHttpServer())
				.get(`/courses/${course.id}/users/compare-participants-list?compareToCourseIds=`)
				.expect(400);
		});
	
	});

});
