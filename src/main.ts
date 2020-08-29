import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as config from "config";
import { getConnection } from "typeorm";
import { DbMockService } from "../test/mocks/db-mock.service";
import { PassedXPercentWithAtLeastYPercentRuleDto, OverallPercentRuleDto } from "./admission-status/dto/admission-rule.dto";
import { AppModule } from "./app.module";
import { StudentMgmtEvent } from "./course/events";
import { StudentMgmtException } from "./course/exceptions/custom-exceptions";
import { EntityAlreadyExistsFilter } from "./shared/entity-already-exists.filter";
import { EntityNotFoundFilter } from "./shared/entity-not-found.filter";
import { RoundingBehavior } from "./utils/math";

async function bootstrap(): Promise<void> {
	const logger = new Logger("Bootstrap");
	logger.verbose(`Environment: ${process.env.NODE_ENV}`);

	const serverConfig = config.get("server");
	const port = process.env.SERVER_PORT || serverConfig.port;

	logger.verbose("Creating application...");
	const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: ["error", "warn", "verbose", "debug"] });
	logger.verbose("Application created!");

	app.useGlobalFilters(new EntityNotFoundFilter());
	app.useGlobalFilters(new EntityAlreadyExistsFilter());
	app.useGlobalPipes(new ValidationPipe({ transform: true })); // Automatically transform primitive params to their type
	app.enableCors({ exposedHeaders: "x-total-count" });
	app.disable("x-powered-by");
	//app.setGlobalPrefix("mgmt/v1");
	
	const options = new DocumentBuilder()
		.addBearerAuth()
		.setTitle("Student-Management-System-API")
		.setDescription("The Student-Management-Sytem-API. <a href='http://localhost:3000/api-json'>JSON</a>") // TODO: Replace hard-coded link
		.setVersion("1.0")
		.addTag("authentication")
		.addTag("courses")
		.addTag("course-participants")
		.addTag("course-config")
		.addTag("assignments")
		.addTag("assessments")
		.addTag("groups")
		.addTag("users")
		.addTag("assignment-registration")
		.addTag("admission-status")
		.addTag("assessment-allocation")
		.addTag("csv")
		.addTag("test")
		.build();

	const document = SwaggerModule.createDocument(app, options, { 
		extraModels: [
			StudentMgmtException, 
			StudentMgmtEvent, 
			RoundingBehavior,
			PassedXPercentWithAtLeastYPercentRuleDto,
			OverallPercentRuleDto
		] 
	});

	SwaggerModule.setup("api", app, document);

	// If demo environment, populate database with test data
	if (process.env.NODE_ENV == "demo") {
		
		const dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	}

	logger.verbose("Starting application...");
	await app.listen(port);
	logger.verbose(`Application started! (Port: ${port})`);
}
bootstrap();
