import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../../../src/auth/services/auth.service";
import { AuthSystemService } from "../../../src/auth/services/auth-system.service";
import { JwtService } from "@nestjs/jwt";
import { AuthCredentialsDto } from "../../../src/auth/dto/auth-credentials.dto";
import { AuthTokenDto } from "../../../src/auth/dto/auth-token.dto";
import { UserRole } from "../../../src/shared/enums";
import { UserDto } from "../../../src/shared/dto/user.dto";
import { USER_STUDENT_JAVA } from "../../mocks/users.mock";

const user = USER_STUDENT_JAVA;

const mock_authSystemService = () => ({
	login: jest.fn().mockResolvedValue(true),
	getUser: jest.fn().mockResolvedValue(user),
});

const mock_JwtService = () => ({
	signAsync: jest.fn().mockResolvedValue("xxx.yyy.zzz")
});

describe("AuthService", () => {

	let service: AuthService;
	let authSystemService: AuthSystemService;
	let jwtService: JwtService;
	let authCredentials: AuthCredentialsDto;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: AuthSystemService, useFactory: mock_authSystemService },
				{ provide: JwtService, useFactory: mock_JwtService }
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		authSystemService = module.get<AuthSystemService>(AuthSystemService);
		jwtService = module.get<JwtService>(JwtService);
		authCredentials = { email: "user.one@test.com", password: "testpassword" };
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("login", () => {
	
		it("Valid credentials -> Returns AuthToken", async () => {
			const expected: AuthTokenDto = {
				accessToken: "xxx.yyy.zzz",
				email: user.email,
				userId: user.id,
				role: user.role,
			};
			const result = await service.login(authCredentials);
			expect(result).toEqual(expected);
		});

		it("Invalid credentials -> Throw Exception", async () => {
			authSystemService.login = jest.fn().mockResolvedValue(false);
			try {
				await service.login(authCredentials);
				expect(true).toEqual(false);
			} catch(error) {
				expect(error).toBeTruthy();
				expect(error.status).toEqual(401);
			}
		});

		it("Calls AuthSystemService for login", async () => {
			await service.login(authCredentials);
			expect(authSystemService.login).toHaveBeenCalledWith(authCredentials);
		});

		it("Calls AuthSystemService to load the user", async () => {
			await service.login(authCredentials);
			expect(authSystemService.getUser).toHaveBeenCalledWith(authCredentials.email);
		});

		it("Calls JwtService to generate JWT", async () => {
			await service.login(authCredentials);
			expect(jwtService.signAsync).toHaveBeenCalled();
		});
	
	});

});
