import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { getConnection } from "typeorm";
import { DbMockService } from "../test/mocks/db-mock.service";
import { Config } from "./.config/config";
import { environment } from "./.config/environment";
import {
	IndividualPercentWithAllowedFailuresRuleDto,
	OverallPercentRuleDto
} from "./admission-status/dto/admission-rule.dto";
import { AppModule } from "./app.module";
import { StudentMgmtEvent } from "./course/events";
import { StudentMgmtException } from "./course/exceptions/custom-exceptions";
import { SubscribedEvents } from "./notification/subscriber/subscriber.dto";
import { SubscriberRepository } from "./notification/subscriber/subscriber.repository";
import { EntityAlreadyExistsFilter } from "./shared/entity-already-exists.filter";
import { EntityNotFoundFilter } from "./shared/entity-not-found.filter";
import { RoundingBehavior } from "./utils/math";

async function bootstrap(): Promise<void> {
	const logger = new Logger("Bootstrap");
	const logLevels = Config.getLogger().levels;
	const port = process.env.SERVER_PORT || Config.getServer().port;
	console.log(`Environment: ${process.env.NODE_ENV}`);
	console.log("Log levels:", logLevels);

	logger.verbose("Creating application...");
	const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: logLevels });
	logger.verbose("Application created!");

	app.useGlobalFilters(new EntityNotFoundFilter(), new EntityAlreadyExistsFilter());
	app.useGlobalPipes(new ValidationPipe({ transform: true })); // Automatically transform primitive params to their type
	app.enableCors({ exposedHeaders: "x-total-count" });
	app.disable("x-powered-by");
	//app.setGlobalPrefix("mgmt/v1");

	setupSwaggerDocument(app);

	// If demo environment, populate database with test data
	if (environment.is("demo")) {
		const dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	}

	// If notification subscribers were specified
	const notificationConfig = Config.getNotifications();
	if (notificationConfig.subscribers?.length > 0) {
		await registerSubscribers(notificationConfig.subscribers);
	}

	logger.verbose("Starting application...");
	await app.listen(port);
	logger.verbose(`Application started! (Port: ${port})`);
}
bootstrap();

function setupSwaggerDocument(app: NestExpressApplication) {
	const options = new DocumentBuilder()
		.addBearerAuth()
		.setTitle("Student-Management-System-API")
		.setDescription(
			"The Student-Management-System-API. <a href='http://localhost:3000/api-json'>JSON</a>"
		) // TODO: Replace hard-coded link
		.setVersion("1.0")
		.addTag("authentication")
		.addTag("course")
		.addTag("course-participants")
		.addTag("course-config")
		.addTag("assignment")
		.addTag("assessment")
		.addTag("group")
		.addTag("user")
		.addTag("assignment-registration")
		.addTag("admission-status")
		.addTag("submission")
		.addTag("assessment-allocation")
		.addTag("notification")
		.addTag("demo")
		.build();

	const document = SwaggerModule.createDocument(app, options, {
		extraModels: [
			StudentMgmtException,
			StudentMgmtEvent,
			RoundingBehavior,
			IndividualPercentWithAllowedFailuresRuleDto,
			OverallPercentRuleDto
		]
	});

	SwaggerModule.setup("api", app, document);
}

/**
 * Inserts or updates the given subscribers.
 */
async function registerSubscribers(
	subscribers: {
		courseId: string;
		name: string;
		url: string;
		events: SubscribedEvents;
	}[]
) {
	const repo = getConnection().getCustomRepository(SubscriberRepository);

	for (const sub of subscribers) {
		await repo.addOrUpdate(sub.courseId, sub);
	}
}
