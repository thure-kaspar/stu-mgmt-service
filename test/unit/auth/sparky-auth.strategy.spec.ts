import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { CacheService } from "../../../src/auth/cache.service";
import { AuthInfo } from "../../../src/auth/dto/auth-info.dto";
import { SparkyAuthStrategy } from "../../../src/auth/guards/sparky-auth.strategy";
import { AuthSystemService } from "../../../src/auth/services/auth-system.service";
import { AuthService } from "../../../src/auth/services/auth.service";
import { User } from "../../../src/shared/entities/user.entity";
import { UserRepository } from "../../../src/user/repositories/user.repository";
import { USER_STUDENT_JAVA } from "../../mocks/users.mock";

const defaultUser = User.fromDto(USER_STUDENT_JAVA);

const mock_AuthService = (): Partial<AuthService> => ({
	createUser: jest.fn().mockResolvedValue(defaultUser),
	updateUser: jest.fn().mockResolvedValue(defaultUser),
	userInfoHasChanged: jest.fn()
});

const mock_AuthSystemService = (): Partial<AuthSystemService> => ({
	checkAuthentication: jest.fn().mockImplementation(() => {
		const authInfo: AuthInfo = {
			token: {
				token: "aaa.bbb.ccc",
				expiration: "DateStr"
			},
			user: {
				fullName: "Max Mustermann",
				role: "DEFAULT",
				username: "mmustermann",
				realm: "default",
				passwordDto: null,
				settings: null
			}
		};
		return authInfo;
	})
});

const mock_UserRepository = (): Partial<UserRepository> => ({
	tryGetUserByUsername: jest.fn().mockResolvedValue(defaultUser)
});

function createExecutionContextWithHeader(authorization?: string): ExecutionContext {
	const request = {
		headers: { authorization }
	};

	return {
		switchToHttp: () => ({
			getRequest: () => request
		})
	} as ExecutionContext;
}

const validAuthHeader = {
	jwt: "aaa.bbb.ccc",
	value: "Bearer aaa.bbb.ccc"
};

describe("SparkyAuthStrategy", () => {
	let cache: CacheService;
	let authService: AuthService;
	let authSystem: AuthSystemService;
	let userRepository: UserRepository;
	let sparkyAuthStrategy: SparkyAuthStrategy;

	beforeEach(() => {
		cache = new CacheService();
		authService = mock_AuthService() as AuthService;
		authSystem = mock_AuthSystemService() as AuthSystemService;
		userRepository = mock_UserRepository() as UserRepository;
		sparkyAuthStrategy = new SparkyAuthStrategy(cache, authService, authSystem, userRepository);
	});

	it("Should be defined", () => {
		expect(sparkyAuthStrategy).toBeDefined();
	});

	describe("canActivate", () => {
		describe("Invalid", () => {
			it("No token -> Throws UnauthorizedException", async () => {
				const context = createExecutionContextWithHeader(null);

				try {
					await sparkyAuthStrategy.canActivate(context);
					expect(true).toEqual(false);
				} catch (error) {
					expect(error).toEqual(
						new UnauthorizedException("Authorization header is missing.")
					);
				}
			});

			it("Invalid format -> Throws UnauthorizedException", async () => {
				const context = createExecutionContextWithHeader("aaa.bbb.ccc");

				try {
					await sparkyAuthStrategy.canActivate(context);
					expect(true).toEqual(false);
				} catch (error) {
					expect(error).toEqual(
						new UnauthorizedException(
							"Incorrect Authorization header format (Requires: Bearer TOKEN)."
						)
					);
				}
			});
		});

		describe("Valid", () => {
			it("Looks up user in cache", async () => {
				cache.get = jest.fn();

				const context = createExecutionContextWithHeader(validAuthHeader.value);
				await sparkyAuthStrategy.canActivate(context);

				expect(cache.get).toHaveBeenCalledWith(validAuthHeader.jwt);
			});

			it("Token is cached -> Attaches user to request + Returns true", async () => {
				cache.get = jest.fn().mockImplementation(() => {
					return USER_STUDENT_JAVA;
				});

				authSystem.checkAuthentication = jest.fn();

				const context = createExecutionContextWithHeader(validAuthHeader.value);

				const result = await sparkyAuthStrategy.canActivate(context);

				expect(authSystem.checkAuthentication).not.toHaveBeenCalled();
				expect(context.switchToHttp().getRequest().user).toEqual(defaultUser);
				expect(result).toEqual(true);
			});

			it("Token not cached -> Calls checkAuthentication from Sparky + Caches User + Returns true", async () => {
				cache.set = jest.fn();

				const context = createExecutionContextWithHeader(validAuthHeader.value);
				const result = await sparkyAuthStrategy.canActivate(context);

				expect(authSystem.checkAuthentication).toHaveBeenCalledWith({
					token: validAuthHeader.jwt
				});
				expect(cache.set).toHaveBeenCalledWith(validAuthHeader.jwt, defaultUser);
				expect(result).toEqual(true);
			});
		});
	});
});
