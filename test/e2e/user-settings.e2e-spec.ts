import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { Language } from "../../src/shared/language";
import { UserSettingsDto } from "../../src/user/dto/user-settings.dto";
import { createApplication } from "../mocks/application.mock";
import { DbMockService } from "../mocks/db-mock.service";
import { USER_SETTINGS_MOCK } from "../mocks/user-settings.mock";
import { USER_STUDENT_JAVA } from "../mocks/users.mock";
import { copy } from "../utils/object-helper";

let app: INestApplication;
let dbMockService: DbMockService; // Should be initialized in every describe-block

const route = (userId: string) => `/users/${userId}/settings`;

describe("POST-REQUESTS of UserSettingsController (e2e)", () => {
	beforeEach(async () => {
		app = await createApplication();
		const dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	describe("(PUT) /users/{userId}/settings", () => {
		const userId = USER_SETTINGS_MOCK[0].userId;
		const settings = copy(USER_SETTINGS_MOCK[0].userSettings);

		settings.allowEmails = !settings.allowEmails;
		settings.language = Language.EN;
		settings.blacklistedEvents = null;

		it("Updates user settings", () => {
			return request(app.getHttpServer())
				.put(route(userId))
				.send(settings)
				.expect(200)
				.expect(({ body }) => {
					const result = body as UserSettingsDto;
					expect(result.allowEmails).toEqual(settings.allowEmails);
					expect(result.language).toEqual(settings.language);
					expect(result.blacklistedEvents).toEqual(settings.blacklistedEvents);
				});
		});
	});
});

describe("GET-REQUESTS of UserSettingsController (e2e)", () => {
	beforeAll(async () => {
		app = await createApplication();
		const dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterAll(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	describe("(GET) /users/{userId}/settings", () => {
		it("Returns user settings", () => {
			const userId = USER_SETTINGS_MOCK[1].userId;

			return request(app.getHttpServer())
				.get(route(userId))
				.expect(200)
				.expect(({ body }) => {
					expect(body).toMatchSnapshot();
				});
		});
	});
});
