import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../../../src/auth/controllers/auth.controller";
import { AuthService } from "../../../src/auth/services/auth.service";

const mock_authService = () => ({

});

describe("Auth Controller", () => {
	let controller: AuthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{ provide: AuthService, useFactory: mock_authService }
			]
		}).compile();

		controller = module.get<AuthController>(AuthController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
