import { createApplication } from "../mocks/application.mock";
import * as request from "supertest";
import { DbMockService } from "../mocks/db-mock.service";
import { getConnection } from "typeorm";
import { INestApplication } from "@nestjs/common";
import { MailDto } from "../../src/mailing/dto/mail.dto";

let app: INestApplication;
let dbMockService: DbMockService;
let mail: MailDto;

describe("POST-Requests of MailingController (e2e)", () => {

	beforeAll(async () => {
		app = await createApplication();

		// Setup mocks
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();

		mail = {
			from: "example@user.com",
			to: "other@user.com",
			subject: "Test email",
			html: "<h2>Test email</h2>",
			text: "Test email"
		};
	});

	afterAll(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /mail/send Valid mail -> Sends the mail", () => {
		return request(app.getHttpServer())
			.post("/mail/send")
			.send(mail)
			.expect(201);
	});

});
