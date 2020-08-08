import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { NodemailerService } from "../../src/mailing/services/nodemailer.service";
import { DisabledMailing } from "./mailing.mock";
import { EntityNotFoundFilter } from "../../src/shared/entity-not-found.filter";
import { AuthGuard } from "@nestjs/passport";
import { AuthGuardMock, CourseMemberGuardMock_LECTURER, CourseMemberGuardMock_STUDENT } from "./guards.mock";
import { CourseMemberGuard } from "../../src/course/guards/course-member.guard";

async function initDefaultApplication(moduleFixture: TestingModule): Promise<INestApplication> {
	const app = moduleFixture.createNestApplication();
	app.useGlobalFilters(new EntityNotFoundFilter());
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
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	})
		.overrideGuard(AuthGuard()).useValue(new AuthGuardMock())
		.overrideGuard(CourseMemberGuard).useClass(CourseMemberGuardMock_LECTURER)
		.overrideProvider(NodemailerService).useClass(DisabledMailing)
		.compile();

	return initDefaultApplication(moduleFixture);
}

/**
 * Creates and returns an initialized NestApplication for e2e-testing purposes.
 * Simulates that all requests are done by an `USER` / `STUDENT` account.
 */
export async function createApplication_STUDENT(): Promise<INestApplication> {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	})
		.overrideGuard(AuthGuard()).useValue(new AuthGuardMock())
		.overrideGuard(CourseMemberGuard).useClass(CourseMemberGuardMock_STUDENT)
		.overrideProvider(NodemailerService).useClass(DisabledMailing)
		.compile();

	return initDefaultApplication(moduleFixture);
}



/**
 * Returns the imports that are required by all TestingModules.
 */
export function getImports(): any[] {
	const imports = [

	];
	return imports;
}
