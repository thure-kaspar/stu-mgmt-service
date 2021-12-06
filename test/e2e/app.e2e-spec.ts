import { TestSetup } from "../utils/e2e";

describe("AppController E2E", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
	});

	afterAll(async () => {
		await setup.teardown();
	});

	it("(GET) /uptime", () => {
		return setup
			.request()
			.get("/uptime")
			.expect(200)
			.expect(({ body }) => {
				expect(body.startTime).toBeTruthy();
				expect(body.uptime).toBeTruthy();
			});
	});
});
