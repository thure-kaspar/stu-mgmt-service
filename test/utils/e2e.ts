import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { Connection, getConnection } from "typeorm";
import { createApplication } from "../mocks/application.mock";
import { DbMockService } from "../mocks/db-mock.service";

/**
 * E2E-Testing utility that provides methods for ...
 * - Application and database connection setup and teardown
 * - HTTP requests to application
 * - Clearing database data
 *
 * @example 
 * describe("TestSetup Example", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
	});

	afterAll(async () => {
		await setup.teardown();
	});
});
 */
export class TestSetup {
	/**
	 * Creates the setup for an e2e testing suite.
	 *
	 * Should be called in the `beforeAll` hook of the root `describe` block.
	 * @param [appFactoryFn] Can be used to supply an application with overwritten guards, etc. By default, `createApplication` from `application.mock.ts` is used.
	 */
	static async create(appFactoryFn?: () => Promise<INestApplication>): Promise<TestSetup> {
		const app = appFactoryFn ? await appFactoryFn() : await createApplication();
		const connection = getConnection();
		const dbMockService = new DbMockService(connection);
		return new TestSetup(app, connection, dbMockService);
	}

	private constructor(
		readonly app: INestApplication,
		readonly connection: Connection,
		readonly dbMockService: DbMockService
	) {}

	/** Returns a request builder that will send the configured HTTP request to the application instance managed by this class. */
	request(): request.SuperTest<request.Test> {
		return request(this.app.getHttpServer());
	}

	/** Drops all data from the database. */
	clearDb(): Promise<void> {
		return this.connection.synchronize(true);
	}

	/** Closes the database connection and terminates the application. */
	async teardown(): Promise<void> {
		await this.connection.close();
		await this.app.close();
	}
}
