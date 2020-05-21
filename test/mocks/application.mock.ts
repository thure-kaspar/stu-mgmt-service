import { INestApplication } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { NodemailerService } from "../../src/mailing/services/nodemailer.service";
import { DisabledMailing } from "./mailing.mock";
import { EntityNotFoundFilter } from "../../src/shared/entity-not-found.filter";
import { AuthGuard } from "@nestjs/passport";
import { AuthGuardMock } from "./guards.mock";

/**
 * Creates and returns an initialized NestApplication for e2e-testing purposes.
 */
export async function createApplication(): Promise<INestApplication> {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	})
		.overrideGuard(AuthGuard()).useValue(new AuthGuardMock())
		.overrideProvider(NodemailerService).useClass(DisabledMailing)
		.compile();

	const app = moduleFixture.createNestApplication();
	app.useGlobalFilters(new EntityNotFoundFilter());
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
