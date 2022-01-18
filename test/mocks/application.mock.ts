import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule, TestingModuleBuilder } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { AuthGuard } from "../../src/auth/guards/auth.guard";
import { CourseMemberGuard } from "../../src/course/guards/course-member/course-member.guard";
import { NodemailerService } from "../../src/mailing/services/nodemailer.service";
import { EntityAlreadyExistsFilter } from "../../src/shared/entity-already-exists.filter";
import { EntityNotFoundFilter } from "../../src/shared/entity-not-found.filter";
import {
	AuthGuardMock,
	CourseMemberGuardMock_LECTURER,
	CourseMemberGuardMock_STUDENT
} from "./guards.mock";
import { DisabledMailing } from "./mailing.mock";

/**
 * Creates and initializes a NestApplication for e2e-testing purposes.
 *
 * - {@link AuthGuard} is overwritten to always return a logged in user with `ADMIN` privileges.
 * - {@link NodemailerService} is replaced by {@link DisabledMailing}.
 *
 * @param override Function that can be used to create additional overrides.
 */
export async function setupDefaultApplication(
	override?: (builder: TestingModuleBuilder) => void
): Promise<INestApplication> {
	const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
		imports: [AppModule]
	})
		.overrideGuard(AuthGuard)
		.useValue(new AuthGuardMock())
		.overrideProvider(NodemailerService)
		.useClass(DisabledMailing);

	// Custom overrides
	override?.(moduleBuilder);

	const fixture = await moduleBuilder.compile();

	return initDefaultApplication(fixture);
}

export async function createAuthTestApplication(): Promise<INestApplication> {
	const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
		imports: [AppModule]
	})
		.overrideProvider(NodemailerService)
		.useClass(DisabledMailing);

	const fixture = await moduleBuilder.compile();
	return initDefaultApplication(fixture);
}

async function initDefaultApplication(moduleFixture: TestingModule): Promise<INestApplication> {
	const app = moduleFixture.createNestApplication();
	app.useGlobalFilters(new EntityNotFoundFilter());
	app.useGlobalFilters(new EntityAlreadyExistsFilter());
	app.useGlobalPipes(new ValidationPipe({ transform: true })); // Automatically transform primitive params to their type
	await app.init();
	return app;
}

/**
 * Creates and returns an initialized NestApplication for e2e-testing purposes.
 * Simulates that all requests are done by an `ADMIN` / `LECTURER` account that has
 * the required permissions.
 */
export async function createApplication(): Promise<INestApplication> {
	return setupDefaultApplication(builder => {
		builder.overrideGuard(CourseMemberGuard).useClass(CourseMemberGuardMock_LECTURER);
	});
}

/**
 * Creates and returns an initialized NestApplication for e2e-testing purposes.
 * Simulates that all requests are done by an `USER` / `STUDENT` account.
 */
export async function createApplication_STUDENT(): Promise<INestApplication> {
	return setupDefaultApplication(builder => {
		builder.overrideGuard(CourseMemberGuard).useClass(CourseMemberGuardMock_STUDENT);
	});
}
