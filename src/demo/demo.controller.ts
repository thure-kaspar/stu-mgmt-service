import { Controller, Logger, NotImplementedException, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { DataSource } from "typeorm";
import { DbMockService } from "../../test/mocks/db-mock.service";
import { environment } from "../.config/environment";
import { Public } from "nest-keycloak-connect";

@ApiTags("demo")
@Controller("demo")
@Public()
export class DemoController {
	constructor(private readonly dataSource: DataSource) {}
	logger = new Logger(DemoController.name);

	@ApiOperation({
		operationId: "reset",
		summary: "Reset demo database.",
		description: "Resets the demo database to its initial state. Disabled in production."
	})
	@Post("reset")
	async reset(): Promise<void> {
		if (environment.is("production")) {
			throw new NotImplementedException("This method is disabled in production environment.");
		}

		this.logger.debug("Resetting database to initial state...");

		await this.dataSource.synchronize(true); // Drop data and rebuild (empty) database
		await new DbMockService(this.dataSource).createAll();
	}
}
