import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../../../src/auth/services/auth.service";
import { AuthSystemService } from "../../../src/auth/services/auth-system.service";
import { JwtService } from "@nestjs/jwt";

const mock_authSystemService = () => ({

});

const mock_JwtService = () => ({

});

describe("AuthService", () => {
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: AuthSystemService, useFactory: mock_authSystemService },
				{ provide: JwtService, useFactory: mock_JwtService }
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
