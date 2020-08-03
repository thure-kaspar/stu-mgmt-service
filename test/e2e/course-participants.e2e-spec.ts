import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { ParticipantDto } from "../../src/course/dto/course-participant/participant.dto";
import { ParticipantsComparisonDto } from "../../src/course/queries/compare-participants-list/participants-comparison.dto";
import { CourseRole } from "../../src/shared/enums";
import { createApplication } from "../mocks/application.mock";
import { COURSE_JAVA_1819, COURSE_JAVA_1920, COURSE_JAVA_2020 } from "../mocks/courses.mock";
import { DbMockService } from "../mocks/db-mock.service";
import { USER_NOT_IN_COURSE, USER_STUDENT_JAVA } from "../mocks/users.mock";
import { COURSE_PARTICIPANTS_ALL } from "../mocks/participants/participants.mock";

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

	describe("/courses/{courseId}/users/{userId}", () => {
		const user = USER_STUDENT_JAVA;

		it("User is participant -> Returns user incl. course related data", () => {
			return request(app.getHttpServer())
				.get(`/courses/${course.id}/users/${user.id}`)
				.expect(({ body }) => {
					const result = body as ParticipantDto;
					expect(result.userId).toEqual(user.id);
					expect(result.role).toEqual(CourseRole.STUDENT);
				});
		});

		it("User is not a participant -> Throws 404", () => {
			const notParticipant = USER_NOT_IN_COURSE;
			console.assert(!COURSE_PARTICIPANTS_ALL.find(x => x.courseId === course.id && x.participant.userId === notParticipant.id),
				"User should not be participant of this course");

			return request(app.getHttpServer())
				.get(`/courses/${course.id}/users/${notParticipant.id}`)
				.expect(404);
		});
	
	});

	describe("/courses/{courseId}/users/query/compare-participants-list", () => {
	
		it("Returns a comparison of participants", () => {
			const queryString = `compareToCourseIds=${COURSE_JAVA_2020.id}&compareToCourseIds=${COURSE_JAVA_1819.id}`;

			return request(app.getHttpServer())
				.get(`/courses/${course.id}/users/query/compare-participants-list?${queryString}`)
				.expect(200)
				.expect(({ body }) => {
					const result = body as ParticipantsComparisonDto;
					expect(result.inComparedCourses.length).toEqual(2);
					expect(result.notInComparedCourses.length).toEqual(5); // TODO: Scalable conditions 
				});
		});

		it("Throws 404 if no courseIds for comparison were specified", () => {
			return request(app.getHttpServer())
				.get(`/courses/${course.id}/users/query/compare-participants-list?compareToCourseIds=`)
				.expect(400);
		});
	
	});

});
