import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../../../src/user/controllers/user.controller";
import { UserService } from "../../../src/user/services/user.service";

const mock_UserService = () => ({

});

describe("User Controller", () => {
	let controller: UserController;
	let userService: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [{ provide: UserService, useFactory: mock_UserService }]
		}).compile();

		controller = module.get<UserController>(UserController);
		userService = module.get<UserService>(UserService);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
