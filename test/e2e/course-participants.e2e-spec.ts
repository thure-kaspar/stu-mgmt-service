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
import {
	COURSE_PARTICIPANTS_ALL,
	COURSE_JAVA_1920_PARTICIPANTS
} from "../mocks/participants/participants.mock";

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

	describe("/courses/{courseId}/users - getUsersOfCourse", () => {
		const route = `/courses/${course.id}/users`;
		const expected = COURSE_JAVA_1920_PARTICIPANTS;

		it("Retrieves all participants", () => {
			return request(app.getHttpServer())
				.get(route)
				.expect(200)
				.expect(({ body }) => {
					const result = body as ParticipantDto[];
					expect(result.length).toEqual(expected.length);
					expect(result[0].userId).toBeTruthy();
					expect(result[0].username).toBeTruthy();
					expect(result[0].displayName).toBeTruthy();
					expect(result[0].role).toBeTruthy();
				});
		});

		it("Filters STUDENTs", () => {
			const role = CourseRole.STUDENT;
			const expected = COURSE_JAVA_1920_PARTICIPANTS.filter(
				p => p.participant.participant.role === role
			);
			console.assert(expected.length > 0, "Expecting >1 STUDENT.");

			const queryString = `courseRole=${role}`;

			return request(app.getHttpServer())
				.get(`${route}?${queryString}`)
				.expect(200)
				.expect(({ body }) => {
					const result = body as ParticipantDto[];
					expect(result.length).toEqual(expected.length);

					result.forEach(participant => {
						expect(participant.role).toEqual(role);
					});
				});
		});

		it("Filters TUTORs", () => {
			const role = CourseRole.TUTOR;
			const expected = COURSE_JAVA_1920_PARTICIPANTS.filter(
				p => p.participant.participant.role === role
			);
			console.assert(expected.length > 0, "Expecting >1 TUTOR.");

			const queryString = `courseRole=${role}`;

			return request(app.getHttpServer())
				.get(`${route}?${queryString}`)
				.expect(200)
				.expect(({ body }) => {
					const result = body as ParticipantDto[];
					expect(result.length).toEqual(expected.length);

					result.forEach(participant => {
						expect(participant.role).toEqual(role);
					});
				});
		});

		it("Filters LECTURERs", () => {
			const role = CourseRole.LECTURER;
			const expected = COURSE_JAVA_1920_PARTICIPANTS.filter(
				p => p.participant.participant.role === role
			);
			console.assert(expected.length > 0, "Expecting >1 LECTURER.");

			const queryString = `courseRole=${role}`;

			return request(app.getHttpServer())
				.get(`${route}?${queryString}`)
				.expect(200)
				.expect(({ body }) => {
					const result = body as ParticipantDto[];
					expect(result.length).toEqual(expected.length);

					result.forEach(participant => {
						expect(participant.role).toEqual(role);
					});
				});
		});

		it("Filters LECTURERs and TUTORs at once", () => {
			const role1 = CourseRole.LECTURER;
			const role2 = CourseRole.TUTOR;
			const expected = COURSE_JAVA_1920_PARTICIPANTS.filter(
				p =>
					p.participant.participant.role === role1 ||
					p.participant.participant.role === role2
			);

			const queryString = `courseRole=${role1}&courseRole=${role2}`;

			return request(app.getHttpServer())
				.get(`${route}?${queryString}`)
				.expect(200)
				.expect(({ body }) => {
					const result = body as ParticipantDto[];
					expect(result.length).toEqual(expected.length);
				});
		});

		it("Filters by name", () => {
			const name = "m";
			const expected = COURSE_JAVA_1920_PARTICIPANTS.filter(
				p =>
					p.participant.participant.username.includes(name) ||
					p.participant.participant.displayName.includes(name)
			);
			console.assert(expected.length > 1, "Expecting >1 participants to match name");

			const queryString = `name=${name}`;

			return request(app.getHttpServer())
				.get(`${route}?${queryString}`)
				.expect(200)
				.expect(({ body }) => {
					const result = body as ParticipantDto[];
					expect(result.length).toEqual(expected.length);
				});
		});

		it("Uses pagination", () => {
			const skip = 2;
			const take = 2;

			const queryString = `skip=${skip}&take=${take}`;

			return request(app.getHttpServer())
				.get(`${route}?${queryString}`)
				.expect(200)
				.expect(({ body }) => {
					const result = body as ParticipantDto[];
					expect(result.length).toEqual(2);
				});
		});
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
			console.assert(
				!COURSE_PARTICIPANTS_ALL.find(
					x => x.courseId === course.id && x.participant.userId === notParticipant.id
				),
				"User should not be participant of this course"
			);

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
				.get(
					`/courses/${course.id}/users/query/compare-participants-list?compareToCourseIds=`
				)
				.expect(400);
		});
	});
});
