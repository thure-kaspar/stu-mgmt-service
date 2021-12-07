import { SubscriberDto } from "../../src/notification/subscriber/subscriber.dto";
import { COURSE_INFO_2_2020 } from "../mocks/courses.mock";
import { SUBSCRIBER_1_INFO_SOSE2020, SUBSCRIBER_MOCK } from "../mocks/subscribers.mock";
import { TestSetup } from "../utils/e2e";

const course = COURSE_INFO_2_2020;
const baseUrl = "/notifications";

describe("Notification E2E", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("PUT-REQUESTS of NotificationController (e2e)", () => {
		beforeEach(async () => {
			await setup.clearDb();
			await setup.dbMockService.createUsers();
			await setup.dbMockService.createCourses();
			await setup.dbMockService.createSubscribers();
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

				return setup
					.request()
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

				return setup
					.request()
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
			await setup.clearDb();
			await setup.dbMockService.createUsers();
			await setup.dbMockService.createCourses();
			await setup.dbMockService.createSubscribers();
		});

		describe("(GET) /notifications/courses/{courseId}/subscribers", () => {
			const route = (courseId: string) => `${baseUrl}/courses/${courseId}/subscribers`;

			it("Retrieves all subscribers", () => {
				const expected = SUBSCRIBER_MOCK.map(mock => ({
					...mock.dto,
					updateDate: null
				}));

				return setup
					.request()
					.get(route(course.id))
					.expect(200)
					.expect(({ body }) => {
						const result = body as SubscriberDto[];
						const resultWithoutDate = result.map(res => ({ ...res, updateDate: null }));
						expect(resultWithoutDate).toMatchSnapshot(expected);
					});
			});

			it("No subscribers -> Empty array", () => {
				return setup
					.request()
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
			await setup.clearDb();
			await setup.dbMockService.createUsers();
			await setup.dbMockService.createCourses();
			await setup.dbMockService.createSubscribers();
		});

		describe("(DELETE) /notifications/courses/{courseId}/subscribers/{name}", () => {
			const route = (courseId: string, name: string) =>
				`${baseUrl}/courses/${courseId}/subscribers/${name}`;

			it("Subscribed -> Removes subscriber", () => {
				const subscriber = SUBSCRIBER_1_INFO_SOSE2020;

				return setup.request().delete(route(course.id, subscriber.name)).expect(200);
			});

			it("Subscriber does not exists -> Throws 404", () => {
				return setup.request().delete(route(course.id, "does-not-exist")).expect(404);
			});
		});
	});
});
