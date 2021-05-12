import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { createApplication } from "../mocks/application.mock";
import { DbMockService } from "../mocks/db-mock.service";

let app: INestApplication;

describe("GET-REQUESTS of AuthController (e2e)", () => {
	beforeAll(async () => {
		app = await createApplication();
		const dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterAll(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	describe("auth/whoAmI", () => {
		it("Returns user associated with the provided auth token", () => {
			return request(app.getHttpServer())
				.get("/auth/whoAmI")
				.expect(200)
				.expect(({ body }) => {
					expect(body).toMatchSnapshot();
				});
		});
	});
});
