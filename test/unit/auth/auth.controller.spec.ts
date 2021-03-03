import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../../../src/auth/controllers/auth.controller";
import { AuthService } from "../../../src/auth/services/auth.service";
import { AuthCredentialsDto } from "../../../src/auth/dto/auth-credentials.dto";
import { AuthTokenDto } from "../../../src/auth/dto/auth-token.dto";
import { UserRole } from "../../../src/shared/enums";
import { UnauthorizedException } from "@nestjs/common";

const mock_authService = () => ({
	login: jest.fn(),
	register: jest.fn()
});

describe("Auth Controller", () => {
	let controller: AuthController;
	let authService: AuthService;
	let authCredentials: AuthCredentialsDto;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [{ provide: AuthService, useFactory: mock_authService }]
		}).compile();

		controller = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
		authCredentials = { email: "user.one@test.com", password: "testpassword" };
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("register", () => {
		it("Calls authService for registration", () => {
			controller.register(authCredentials);
			expect(authService.register).toBeCalledWith(authCredentials);
		});
	});

	describe("login", () => {
		it("Calls authService for login", () => {
			controller.login(authCredentials);
			expect(authService.login).toHaveBeenCalledWith(authCredentials);
		});

		it("Valid credentials -> Returns AuthToken", async () => {
			const expected: AuthTokenDto = {
				accessToken: "xxx.yyy.zzz",
				expiration: new Date(),
				_expirationInLocale: "TODO",
				user: {
					email: authCredentials.email,
					displayName: "user_id_1",
					id: "user_id_1",
					username: "max_mustermann",
					role: UserRole.USER
				}
			};
			authService.login = jest.fn().mockResolvedValue(expected);
			const result = await controller.login(authCredentials);
			expect(result).toEqual(expected);
		});

		it("Invalid credentials -> Throws Exception", async () => {
			authService.login = jest.fn().mockRejectedValue(new UnauthorizedException());
			try {
				await controller.login(authCredentials);
				expect(true).toEqual(false);
			} catch (error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(401);
			}
		});
	});
});
