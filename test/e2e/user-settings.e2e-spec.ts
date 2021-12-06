import { Language } from "../../src/shared/language";
import { UserSettingsDto } from "../../src/user/dto/user-settings.dto";
import { USER_SETTINGS_MOCK } from "../mocks/user-settings.mock";
import { TestSetup } from "../utils/e2e";
import { copy } from "../utils/object-helper";

const route = (userId: string) => `/users/${userId}/settings`;

describe("UserSettings E2E", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("POST-REQUESTS of UserSettingsController (e2e)", () => {
		beforeEach(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("(PUT) /users/{userId}/settings", () => {
			const userId = USER_SETTINGS_MOCK[0].userId;
			const settings = copy(USER_SETTINGS_MOCK[0].userSettings);

			settings.allowEmails = !settings.allowEmails;
			settings.language = Language.EN;
			settings.blacklistedEvents = null;

			it("Updates user settings", () => {
				return setup
					.request()
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
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("(GET) /users/{userId}/settings", () => {
			it("Returns user settings", () => {
				const userId = USER_SETTINGS_MOCK[1].userId;

				return setup
					.request()
					.get(route(userId))
					.expect(200)
					.expect(({ body }) => {
						expect(body).toMatchSnapshot();
					});
			});
		});
	});
});
