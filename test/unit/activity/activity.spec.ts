import { Repository } from "typeorm";
import { Activity } from "../../../src/activity/activity.entity";
import {
	ActivityEvent,
	ActivityEventHandler,
	isSameDay
} from "../../../src/activity/activity.event";

const mock_ActivityRepository = (): Partial<Repository<Activity>> => ({
	findOne: jest.fn(),
	insert: jest.fn()
});

describe("Activity", () => {
	describe("isSameDate", () => {
		it.each([
			["Identical date", new Date(2022, 1, 1, 1), new Date(2022, 1, 1, 1), true],
			["Different hour", new Date(2022, 1, 1, 1), new Date(2022, 1, 1, 2), true],
			["Different day", new Date(2022, 1, 1, 1), new Date(2022, 1, 8, 2), false],
			["Different month", new Date(2022, 1, 1, 1), new Date(2022, 8, 1, 1), false],
			["Different year", new Date(2022, 1, 1, 1), new Date(2028, 1, 1, 1), false]
		])("%s", (_testCase, first, second, expected) => {
			expect(isSameDay(first, second)).toEqual(expected);
		});
	});

	describe("ActivityEvent", () => {
		it("Has Date", () => {
			const event = new ActivityEvent("user_123", "course_123");
			expect(event.date).toBeDefined();
		});
	});

	describe("ActivityEventHandler", () => {
		let handler: ActivityEventHandler;
		let activityRepository: Repository<Activity>;

		beforeEach(() => {
			activityRepository = mock_ActivityRepository() as Repository<Activity>;
			handler = new ActivityEventHandler(activityRepository);
		});

		it("Should be defined", () => {
			expect(handler).toBeDefined();
		});

		it("No latest activity -> Inserts Activity", async () => {
			const event: ActivityEvent = {
				userId: "user_123",
				courseId: "course_123",
				date: new Date(2022, 1, 1, 1)
			};

			await handler.handle(event);

			expect(activityRepository.findOne).toHaveBeenCalled();
			expect(activityRepository.insert).toHaveBeenCalledWith(
				Activity.create(event.userId, event.courseId)
			);
		});

		it("Latest activity was another day -> Inserts Activity", async () => {
			const event: ActivityEvent = {
				userId: "user_123",
				courseId: "course_123",
				date: new Date(2022, 1, 1, 1)
			};

			activityRepository.findOne = jest.fn().mockImplementation(() => {
				const activity = Activity.create(event.userId, event.courseId);
				activity.date = new Date(2022, 1, 7, 1);
				return activity;
			});

			await handler.handle(event);

			expect(activityRepository.findOne).toHaveBeenCalled();
			expect(activityRepository.insert).toHaveBeenCalledWith(
				Activity.create(event.userId, event.courseId)
			);
		});

		it("Latest activity was on the same day -> NOOP", async () => {
			const event: ActivityEvent = {
				userId: "user_123",
				courseId: "course_123",
				date: new Date(2022, 1, 1, 1)
			};

			activityRepository.findOne = jest.fn().mockImplementation(() => {
				const activity = Activity.create(event.userId, event.courseId);
				activity.date = event.date;
				return activity;
			});

			await handler.handle(event);

			expect(activityRepository.findOne).toHaveBeenCalled();
			expect(activityRepository.insert).not.toHaveBeenCalled();
		});
	});
});
