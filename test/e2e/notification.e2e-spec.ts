import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { SubscriberDto } from "../../src/notification/subscriber/subscriber.dto";
import { createApplication } from "../mocks/application.mock";
import { COURSE_INFO_2_2020 } from "../mocks/courses.mock";
import { DbMockService } from "../mocks/db-mock.service";
import { SUBSCRIBER_1_INFO_SOSE2020, SUBSCRIBER_MOCK } from "../mocks/subscribers.mock";

let app: INestApplication;
let dbMockService: DbMockService;

const course = COURSE_INFO_2_2020;
const baseUrl = "/notifications";

describe("PUT-REQUESTS of NotificationController (e2e)", () => {
	beforeEach(async () => {
		app = await createApplication();

		// Setup mocks
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createUsers();
		await dbMockService.createCourses();
		await dbMockService.createSubscribers();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	describe("(PUT) /notifications/courses/{courseId}/subscribers/{name}", () => {
		const route = (courseId: string, name: string) =>
			`${baseUrl}/courses/${courseId}/subscribers/${name}`;

		it("Not subscribed -> Adds subscriber", () => {
			const subscriber: SubscriberDto = {
				name: "mySubscriber",
				events: { ALL: true },
				url: "http://example.url"
			};

			return request(app.getHttpServer())
				.put(route(course.id, subscriber.name))
				.send(subscriber)
				.expect(200)
				.expect(({ body }) => {
					const result = body as SubscriberDto;
					expect(result.name).toEqual(subscriber.name);
					expect(result.events).toEqual(subscriber.events);
					expect(result.url).toEqual(subscriber.url);
				});
		});

		it("Already subscribed -> Updates subscriber", () => {
			const subscriber = SUBSCRIBER_1_INFO_SOSE2020;

			return request(app.getHttpServer())
				.put(route(course.id, subscriber.name))
				.send(subscriber)
				.expect(200)
				.expect(({ body }) => {
					const result = body as SubscriberDto;
					expect(result.name).toEqual(subscriber.name);
					expect(result.events).toEqual(subscriber.events);
					expect(result.url).toEqual(subscriber.url);
				});
		});
	});
});

describe("GET-Requests of NotificationController (e2e)", () => {
	beforeAll(async () => {
		app = await createApplication();

		// Setup mocks
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createUsers();
		await dbMockService.createCourses();
		await dbMockService.createSubscribers();
	});

	afterAll(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	describe("(GET) /notifications/courses/{courseId}/subscribers", () => {
		const route = (courseId: string) => `${baseUrl}/courses/${courseId}/subscribers`;

		it("Retrieves all subscribers", () => {
			const expected = SUBSCRIBER_MOCK.map(mock => ({
				...mock.dto,
				updateDate: null
			}));

			return request(app.getHttpServer())
				.get(route(course.id))
				.expect(200)
				.expect(({ body }) => {
					const result = body as SubscriberDto[];
					const resultWithoutDate = result.map(res => ({ ...res, updateDate: null }));
					expect(resultWithoutDate).toMatchSnapshot(expected);
				});
		});

		it("No subscribers -> Empty array", () => {
			return request(app.getHttpServer())
				.get(route("java-wise1920"))
				.expect(200)
				.expect(({ body }) => {
					expect(body).toEqual([]);
				});
		});
	});
});

describe("DELETE-Requests of NotificationController (e2e)", () => {
	beforeEach(async () => {
		app = await createApplication();

		// Setup mocks
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createUsers();
		await dbMockService.createCourses();
		await dbMockService.createSubscribers();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	describe("(DELETE) /notifications/courses/{courseId}/subscribers/{name}", () => {
		const route = (courseId: string, name: string) =>
			`${baseUrl}/courses/${courseId}/subscribers/${name}`;

		it("Subscribed -> Removes subscriber", () => {
			const subscriber = SUBSCRIBER_1_INFO_SOSE2020;

			return request(app.getHttpServer())
				.delete(route(course.id, subscriber.name))
				.expect(200);
		});

		it("Subscriber does not exists -> Throws 404", () => {
			return request(app.getHttpServer())
				.delete(route(course.id, "does-not-exist"))
				.expect(404);
		});
	});
});
