import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as config from "config";
import { DbMockService } from "../test/mocks/db-mock.service";
import { getConnection } from "typeorm";
import { EntityNotFoundFilter } from "./shared/entity-not-found.filter";

async function bootstrap(): Promise<void> {
	const serverConfig = config.get("server");
	const port = process.env.SERVER_PORT || serverConfig.port;
	const app = await NestFactory.create(AppModule);
	app.useGlobalFilters(new EntityNotFoundFilter());
	app.enableCors();
	//app.setGlobalPrefix("mgmt/v1");

	const options = new DocumentBuilder()
		.setTitle("Student-Management-System-API")
		.setDescription("The Student-Management-Sytem-API description.")
		.setVersion("1.0")
		.addTag("assessments")
		.addTag("assignments")
		.addTag("authentication")
		.addTag("courses")
		.addTag("course-config")
		.addTag("groups")
		.addTag("users")
		.addTag("test")
		.build();
	const document = SwaggerModule.createDocument(app, options);
	SwaggerModule.setup("api", app, document);

	// If demo environment, populate database with test data
	if (process.env.NODE_ENV == "demo") {
		const dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	}

	await app.listen(port);
}
bootstrap();
