import { TestSetup } from "../utils/e2e";

describe("Auth E2E", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("GET-REQUESTS of AuthController (e2e)", () => {
		beforeAll(async () => {
			await setup.clearDb();
			await setup.dbMockService.createAll();
		});

		describe("auth/whoAmI", () => {
			it("Returns user associated with the provided auth token", () => {
				return setup
					.request()
					.get("/auth/whoAmI")
					.expect(200)
					.expect(({ body }) => {
						expect(body).toMatchSnapshot();
					});
			});
		});
	});
});
