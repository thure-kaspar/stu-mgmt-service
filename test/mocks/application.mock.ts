import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { NodemailerService } from "../../src/mailing/services/nodemailer.service";
import { DisabledMailing } from "./mailing.mock";
import { EntityNotFoundFilter } from "../../src/shared/entity-not-found.filter";
import { AuthGuard } from "@nestjs/passport";
import { AuthGuardMock, CourseMemberGuardMock } from "./guards.mock";
import { CourseMemberGuard } from "../../src/course/guards/course-member.guard";

/**
 * Creates and returns an initialized NestApplication for e2e-testing purposes.
 */
export async function createApplication(): Promise<INestApplication> {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	})
		.overrideGuard(AuthGuard()).useValue(new AuthGuardMock())
		.overrideGuard(CourseMemberGuard).useClass(CourseMemberGuardMock)
		.overrideProvider(NodemailerService).useClass(DisabledMailing)
		.compile();

	const app = moduleFixture.createNestApplication();
	app.useGlobalFilters(new EntityNotFoundFilter());
	app.useGlobalPipes(new ValidationPipe({ transform: true })); // Automatically transform primitive params to their type
	await app.init();

	return app;
}

/**
 * Returns the imports that are required by all TestingModules.
 */
export function getImports(): any[] {
	const imports = [

	];
	return imports;
}
