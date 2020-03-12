import { INestApplication } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";

/**
 * Creates and returns an initialized NestApplication for e2e-testing purposes.
 */
export async function createApplication(): Promise<INestApplication> {
	let app: INestApplication;

	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	app = moduleFixture.createNestApplication();
	await app.init();
	return app;
}