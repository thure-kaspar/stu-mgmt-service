import { ActivityDto } from "../../src/activity/activity.dto";
import { Activity } from "../../src/activity/activity.entity";
import { ActivityEventHandler } from "../../src/activity/activity.event";
import { createAuthTestApplication } from "../mocks/application.mock";
import { COURSE_INFO_2_2020, COURSE_JAVA_1920 } from "../mocks/courses.mock";
import {
	USER_MGMT_ADMIN_JAVA_LECTURER,
	USER_STUDENT_2_JAVA,
	USER_STUDENT_3_JAVA_TUTOR,
	USER_STUDENT_JAVA
} from "../mocks/users.mock";
import { TestSetup } from "../utils/e2e";

const act1 = Activity.create(USER_STUDENT_JAVA.id, COURSE_JAVA_1920.id);
const act2 = Activity.create(USER_STUDENT_JAVA.id, COURSE_JAVA_1920.id);
act1.date = new Date(2022, 1, 1);
act2.date = new Date(2022, 1, 3);

const act3 = Activity.create(USER_STUDENT_2_JAVA.id, COURSE_JAVA_1920.id);
act3.date = new Date(2022, 1, 2);

const activityOtherCourse = Activity.create(USER_STUDENT_JAVA.id, COURSE_INFO_2_2020.id);
activityOtherCourse.date = new Date(2022, 1, 4);

describe("Activity E2E", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create(createAuthTestApplication);
		await setup.dbMockService.createAll();

		// Create activity data
		const repository = setup.dataSource.getRepository(Activity);
		await repository.insert([act1, activityOtherCourse, act2, act3]);
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("GET - /courses/{courseId}/activity", () => {
		it("Unauthorized", () => {
			return setup
				.requestWithAuth(
					"get",
					`/courses/${COURSE_JAVA_1920.id}/activity`,
					USER_STUDENT_JAVA.username
				)
				.expect(403);
		});

		it("Returns activity data", async () => {
			return setup
				.requestWithAuth(
					"get",
					`/courses/${COURSE_JAVA_1920.id}/activity`,
					USER_MGMT_ADMIN_JAVA_LECTURER.username
				)
				.expect(200)
				.expect(({ body }) => {
					const result = body as ActivityDto[];
					expect(result).toHaveLength(4); // Course has 4 students

					expect(result[1].user.username).toEqual(USER_STUDENT_2_JAVA.username);
					expect(result[1].dates).toHaveLength(1);

					expect(result[3].user.username).toEqual(USER_STUDENT_JAVA.username);
					expect(result[3].dates).toHaveLength(2);
				});
		});
	});

	describe("ActivityEventHandler", () => {
		let handler: ActivityEventHandler;

		beforeEach(() => {
			handler = setup.app.get(ActivityEventHandler);
		});

		it("Should be defined", () => {
			expect(handler).toBeDefined();
		});

		describe("_tryGetLatestActivity", () => {
			it("Exists -> Returns latest activity", async () => {
				const result = await handler._tryGetLatestActivity(
					USER_STUDENT_JAVA.id,
					COURSE_JAVA_1920.id
				);
				expect(result.date).toEqual(act2.date);
			});

			it("Does not exist -> Returns undefined", async () => {
				const result = await handler._tryGetLatestActivity(
					USER_STUDENT_3_JAVA_TUTOR.id,
					COURSE_JAVA_1920.id
				);
				expect(result).toBeUndefined();
			});
		});

		describe("handle", () => {
			it("Same day -> NOOP", async () => {
				await handler.handle({
					courseId: COURSE_JAVA_1920.id,
					userId: USER_STUDENT_JAVA.id,
					date: act2.date
				});

				const repository = setup.dataSource.getRepository(Activity);

				const activity = await repository.find({
					where: { courseId: COURSE_JAVA_1920.id, userId: USER_STUDENT_JAVA.id }
				});

				expect(activity).toHaveLength(2);
			});

			it("Other day -> Inserts activity into DB", async () => {
				await handler.handle({
					courseId: COURSE_JAVA_1920.id,
					userId: USER_STUDENT_JAVA.id,
					date: new Date(2022, 1, 7)
				});

				const repository = setup.dataSource.getRepository(Activity);

				const activity = await repository.find({
					where: { courseId: COURSE_JAVA_1920.id, userId: USER_STUDENT_JAVA.id }
				});

				expect(activity).toHaveLength(3);
			});
		});
	});
});
